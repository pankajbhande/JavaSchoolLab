// MySQL syllabus (from the course outline, 47 sections). Each section becomes a module and each
// listed name a topic. Content lives in ./topics/mysql/s<NN>*.ts, keyed by the exact topic name,
// and uses the same DeepDive shape as the Python course (intro, need, real-time use, pros, cons,
// limits, diagram, architect notes, SQL code with output under every point).

import type { SubTopic, Topic } from './types';
import { withDeepDive } from './topics/python/deepdive/deepDive';
import { mysqlDeepDives } from './topics/mysql';
import { withExtras } from './topics/mysql/extras/extra';
import { mysqlExtras } from './topics/mysql/extras';
import { withDeep } from './topics/mysql/extras/deep';
import { mysqlDeep } from './topics/mysql/extras/deepIndex';

export const mysqlSyllabus: { id: string; name: string; topics: string[] }[] = [
    { id: 'my-db-fundamentals', name: 'Database Fundamentals', topics: [
        'What is a Database?', 'DBMS vs RDBMS', 'What is MySQL?', 'Database, Table, Row & Column', 'Schema',
        'Primary Key & Foreign Key Basics', 'Candidate, Composite & Unique Keys', 'Constraints Overview',
        'One-to-One Relationship', 'One-to-Many Relationship', 'Many-to-Many Relationship', 'Relational Database Concepts', 'SQL vs MySQL'] },
    { id: 'my-installation', name: 'MySQL Installation & Environment', topics: [
        'Installing MySQL', 'MySQL Server & Client', 'MySQL Workbench', 'MySQL Shell', 'Connecting to MySQL & Basic CLI Commands',
        'Creating Users', 'MySQL Configuration & Data Directory', 'Starting & Stopping the MySQL Service'] },
    { id: 'my-sql-basics', name: 'SQL Basics', topics: [
        'Database Operations: CREATE, SHOW, USE & DROP', 'Table Operations: CREATE, SHOW & DESCRIBE', 'ALTER TABLE', 'DROP, TRUNCATE & RENAME'] },
    { id: 'my-data-types', name: 'Data Types', topics: [
        'Numeric Types: INT, BIGINT, SMALLINT & TINYINT', 'DECIMAL, FLOAT & DOUBLE', 'CHAR & VARCHAR', 'TEXT, MEDIUMTEXT & LONGTEXT',
        'DATE, TIME & YEAR', 'DATETIME vs TIMESTAMP', 'BOOLEAN, JSON & Binary Types', 'Storage Size, Range & Type Performance'] },
    { id: 'my-constraints', name: 'Constraints', topics: [
        'PRIMARY KEY Constraint', 'FOREIGN KEY Constraint', 'UNIQUE Constraint', 'NOT NULL & DEFAULT', 'CHECK Constraint'] },
    { id: 'my-crud', name: 'CRUD Operations', topics: ['INSERT', 'SELECT Basics', 'UPDATE', 'DELETE'] },
    { id: 'my-select', name: 'SELECT Queries', topics: [
        'WHERE Clause', 'ORDER BY', 'LIMIT & Pagination', 'DISTINCT', 'GROUP BY & HAVING in SELECT', 'Order of Clause Execution'] },
    { id: 'my-operators', name: 'Operators', topics: [
        'Comparison Operators', 'Logical Operators: AND, OR & NOT', 'BETWEEN, IN & NOT IN', 'LIKE & Pattern Matching', 'IS NULL & IS NOT NULL'] },
    { id: 'my-functions', name: 'MySQL Functions', topics: [
        'String Functions', 'Numeric Functions', 'Date Functions', 'NULL Functions: COALESCE, IFNULL & NULLIF'] },
    { id: 'my-aggregates', name: 'Aggregate Functions', topics: [
        'COUNT, SUM, AVG, MIN & MAX', 'GROUP BY with Aggregates', 'WHERE vs HAVING'] },
    { id: 'my-joins', name: 'Joins', topics: [
        'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN', 'SELF JOIN', 'Multiple Joins & Many-to-Many Joins', 'Join vs Subquery & Join Performance'] },
    { id: 'my-subqueries', name: 'Subqueries', topics: [
        'Scalar & Single-Row Subqueries', 'Multi-Row Subqueries with IN', 'Correlated Subqueries', 'EXISTS Subqueries', 'ANY & ALL Subqueries'] },
    { id: 'my-set-ops', name: 'Set Operations', topics: ['UNION vs UNION ALL', 'INTERSECT & EXCEPT', 'Column Compatibility & Duplicate Handling'] },
    { id: 'my-design', name: 'Relationships & Database Design', topics: [
        'Designing One-to-One Tables', 'Designing One-to-Many & Many-to-Many Tables', 'Junction (Bridge) Tables', 'Referential Integrity', 'Cascading Operations'] },
    { id: 'my-normalization', name: 'Normalization', topics: [
        'Data Redundancy & Functional Dependency', '1NF', '2NF', '3NF', 'BCNF', 'Denormalization'] },
    { id: 'my-keys', name: 'Keys', topics: [
        'Alternate Key', 'Natural Key vs Surrogate Key', 'Primary Key vs Unique Key'] },
    { id: 'my-indexes', name: 'Indexes', topics: [
        'What is an Index?', 'B-Tree Indexes', 'Clustered vs Secondary Index', 'Composite Index & Leftmost Prefix', 'Unique & Prefix Indexes',
        'Full-Text & Spatial Indexes', 'Covering Index', 'Index Selectivity & Cardinality'] },
    { id: 'my-query-optimization', name: 'Query Optimization', topics: [
        'EXPLAIN', 'EXPLAIN ANALYZE', 'Full Table Scan vs Index Scan', 'Join Algorithms', 'Temporary Tables & Filesort in Plans', 'Cost, Cardinality & Slow Queries'] },
    { id: 'my-transactions', name: 'Transactions', topics: [
        'ACID Properties', 'START TRANSACTION, COMMIT & ROLLBACK', 'SAVEPOINT'] },
    { id: 'my-isolation', name: 'Transaction Isolation Levels', topics: [
        'READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE', 'Dirty, Non-Repeatable & Phantom Reads', 'Lost Update'] },
    { id: 'my-locks', name: 'Locks & Concurrency', topics: [
        'Shared & Exclusive Locks', 'Row-Level vs Table Locks', 'Record, Gap & Next-Key Locks', 'SELECT ... FOR UPDATE', 'Lock Contention & Deadlocks'] },
    { id: 'my-views', name: 'Views', topics: ['CREATE, ALTER & DROP VIEW', 'Updatable Views', 'Views for Security', 'Views vs Tables vs Stored Procedures'] },
    { id: 'my-procedures', name: 'Stored Procedures', topics: [
        'CREATE PROCEDURE & CALL', 'IN, OUT & INOUT Parameters', 'Variables, IF & CASE in Procedures', 'Loops in Procedures', 'Error Handling in Procedures'] },
    { id: 'my-functions-stored', name: 'Stored Functions', topics: [
        'CREATE FUNCTION', 'Deterministic Functions', 'Stored Function vs Procedure'] },
    { id: 'my-triggers', name: 'Triggers', topics: [
        'BEFORE Triggers', 'AFTER Triggers', 'Audit Logging with Triggers', 'When to Avoid Triggers'] },
    { id: 'my-cursors', name: 'Cursors', topics: [
        'Declaring, Opening & Fetching Cursors', 'Cursor Loops & Handlers', 'Cursors vs Set-Based SQL'] },
    { id: 'my-cte', name: 'Common Table Expressions', topics: [
        'CTE Basics & Multiple CTEs', 'Recursive CTE', 'CTE vs Subquery vs Temporary Table'] },
    { id: 'my-window', name: 'Window Functions', topics: [
        'ROW_NUMBER, RANK & DENSE_RANK', 'NTILE', 'LAG & LEAD', 'FIRST_VALUE & LAST_VALUE', 'PARTITION BY & Window Frames',
        'Running Totals & Moving Averages', 'Top-N per Group'] },
    { id: 'my-json', name: 'JSON in MySQL', topics: [
        'JSON Data Type & JSON_OBJECT / JSON_ARRAY', 'JSON_EXTRACT & JSON_VALUE', 'JSON Indexes & Generated Columns', 'JSON vs Relational Columns'] },
    { id: 'my-fulltext', name: 'Full-Text Search', topics: [
        'FULLTEXT Indexes', 'MATCH ... AGAINST', 'Natural Language vs Boolean Mode', 'Full-Text vs Elasticsearch/OpenSearch'] },
    { id: 'my-temp-tables', name: 'Temporary Tables', topics: [
        'CREATE TEMPORARY TABLE', 'Temporary Table vs CTE vs Permanent Table'] },
    { id: 'my-users-security', name: 'User Management & Security', topics: [
        'CREATE, ALTER & DROP USER', 'GRANT, REVOKE & SHOW GRANTS', 'Roles & Privileges', 'Least Privilege & Application Users'] },
    { id: 'my-sql-injection', name: 'SQL Injection', topics: [
        'How SQL Injection Works', 'Prepared Statements & Parameterized Queries'] },
    { id: 'my-backup', name: 'Backup & Restore', topics: [
        'Logical vs Physical Backup', 'mysqldump & Restore', 'Backup Strategies: Full & Incremental', 'Point-in-Time Recovery'] },
    { id: 'my-binlog', name: 'Binary Logs', topics: [
        'Binary Log Basics', 'Binlog Formats: Statement, Row & Mixed', 'Binlog for Replication & Recovery'] },
    { id: 'my-replication', name: 'Replication', topics: [
        'Source/Replica Architecture', 'Asynchronous & Semi-Synchronous Replication', 'Replication Lag', 'Read Replicas & Failover', 'GTID', 'Replication Monitoring'] },
    { id: 'my-ha', name: 'High Availability', topics: [
        'Failover & Automatic Failover', 'RPO & RTO', 'Disaster Recovery', 'InnoDB Cluster & Group Replication', 'MySQL Router'] },
    { id: 'my-partitioning', name: 'Partitioning', topics: [
        'Why Partition?', 'Range & List Partitioning', 'Hash & Key Partitioning', 'Partition Pruning & Management'] },
    { id: 'my-innodb', name: 'InnoDB Internals', topics: [
        'InnoDB Storage Engine', 'Buffer Pool', 'Redo Log & Undo Log', 'Doublewrite Buffer & Change Buffer', 'Adaptive Hash Index', 'Tablespaces, Data Pages & Index Pages'] },
    { id: 'my-mvcc', name: 'MVCC', topics: [
        'What is MVCC?', 'Consistent Reads & Read Views', 'Undo Logs & Transaction IDs', 'Visibility Rules & Snapshot Isolation'] },
    { id: 'my-tuning', name: 'MySQL Performance Tuning', topics: [
        'Slow Query Log', 'Performance Schema & sys Schema', 'Index & Query Tuning', 'Buffer Pool & Memory Tuning', 'Connections, Threads & Disk I/O',
        'SHOW PROCESSLIST & SHOW ENGINE INNODB STATUS'] },
    { id: 'my-architecture', name: 'MySQL Architecture', topics: [
        'Connection Layer', 'SQL Parser & Query Optimizer', 'Execution Engine', 'Storage Engines'] },
    { id: 'my-backend', name: 'MySQL with Backend Applications', topics: [
        'MySQL with Java & Spring Boot', 'MySQL with Python & Django', 'MySQL with Node.js, .NET, PHP & Go', 'Connection Pooling', 'Prepared Statements in Applications',
        'Transactions in Applications', 'Repository Pattern', 'Pagination Strategies', 'N+1 Problem', 'Lazy vs Eager Loading', 'Database Migrations'] },
    { id: 'my-orm', name: 'ORM & MySQL', topics: [
        'JPA, Hibernate & Spring Data JPA', 'SQLAlchemy & Django ORM', 'Prisma, Sequelize & TypeORM', 'Inspecting the SQL an ORM Generates'] },
    { id: 'my-real-design', name: 'Database Design for Real Projects', topics: [
        'E-commerce Schema', 'Banking Schema', 'Social Media Schema', 'Job Portal Schema'] },
    { id: 'my-interview', name: 'Advanced SQL Interview Problems', topics: [
        'Second & Nth Highest Salary Problems', 'Find & Remove Duplicate Records', 'Employees Earning More Than Their Manager',
        'Department-wise Highest Salary & Top 3 per Department', 'Running Total & Moving Average Problems', 'Consecutive Dates, Missing Numbers & Gaps and Islands',
        'Employee Hierarchy & Recursive Organizational Tree', 'Customers Who Never Ordered', 'Most Frequently Purchased Product & Monthly Revenue',
        'Year-over-Year Growth & Retention Analysis'] },
    { id: 'my-production', name: 'Production-Level MySQL', topics: [
        'Monitoring, Logging & Metrics', 'Query Profiling & Capacity Planning', 'Backup Verification & Disaster Recovery', 'Security Hardening',
        'Schema Migration & Zero-Downtime Migrations', 'Deployment & Scaling Strategies'] }
];

const emptyTopic = (moduleId: string, name: string): Topic => ({
    id: `${moduleId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    name,
    beginner: [],
    expert: []
});

/** Modules appended to the MySQL course after the original hand-written topics. */
export const mysqlSyllabusModules: SubTopic[] = mysqlSyllabus.map(m => ({
    id: m.id,
    name: m.name,
    topics: m.topics.map(t => withDeep(withExtras(withDeepDive(emptyTopic(m.id, t), mysqlDeepDives[t]), mysqlExtras[t]), mysqlDeep[t]))
}));
