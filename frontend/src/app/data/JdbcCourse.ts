import type { Course } from './types';
import { introductionToJdbc } from './topics/IntroductionToJdbc';
import { jdbcConnectionSetup } from './topics/JdbcConnectionSetup';
import { jdbcStatementTypes } from './topics/JdbcStatementTypes';
import { jdbcResultSet } from './topics/JdbcResultSet';
import { jdbcStoredProcedures } from './topics/JdbcStoredProcedures';
import { jdbcTransactions } from './topics/JdbcTransactions';
import { jdbcBatchProcessing } from './topics/JdbcBatchProcessing';
import { jdbcExceptionHandling } from './topics/JdbcExceptionHandling';
import { jdbcConnectionPooling } from './topics/JdbcConnectionPooling';
import { jdbcRowSet } from './topics/JdbcRowSet';
import { jdbcBestPractices } from './topics/JdbcBestPractices';

// JDBC authored as its own course file; it is shown as the first modules of the Hibernate course (see courseMerges.ts).
export const JdbcCourse: Course[] = [
    {
        id: 'jdbc',
        name: 'JDBC',
        icon: 'Database',
        subTopics: [
            {
                id: 'jdbc basic',
                name: 'JDBC Basics',
                topics: [
                    introductionToJdbc,
                    jdbcConnectionSetup,
                    jdbcStatementTypes,
                    jdbcResultSet,
                    jdbcStoredProcedures,
                    jdbcTransactions,
                    jdbcBatchProcessing,
                    jdbcExceptionHandling,
                    jdbcConnectionPooling,
                    jdbcRowSet,
                    jdbcBestPractices
                ]
            }
        ],
        cheatNotes: [
            'JDBC - Java Database Connectivity, API to connect Java apps to relational DBs',
            'JDBC architecture - Application -> JDBC API -> JDBC Driver -> Database',
            'Type 1 driver - JDBC-ODBC bridge, deprecated, needs ODBC layer',
            'Type 2 driver - Native-API driver, needs vendor DB client library',
            'Type 3 driver - Network protocol driver, uses middleware server',
            'Type 4 driver - Thin/pure Java driver, talks directly to DB (most used)',
            'Class.forName() - Loads and registers the JDBC driver class',
            'DriverManager.getConnection() - Establishes a connection to the database',
            'Connection - Represents an active session with the database',
            'createStatement() - Creates a Statement for static SQL',
            'Statement - Executes plain SQL, vulnerable to SQL injection',
            'PreparedStatement - Precompiled, parameterized query; prevents SQL injection',
            'PreparedStatement is faster for repeated execution of the same query',
            'CallableStatement - Used to execute stored procedures',
            'executeQuery() - Executes SELECT, returns a ResultSet',
            'executeUpdate() - Executes INSERT/UPDATE/DELETE, returns affected row count',
            'execute() - Executes any SQL, returns boolean indicating result type',
            'ResultSet - Cursor-based table of query results',
            'ResultSet.next() - Moves cursor to next row, returns false at end',
            'ResultSet types - TYPE_FORWARD_ONLY, TYPE_SCROLL_INSENSITIVE, TYPE_SCROLL_SENSITIVE',
            'ResultSetMetaData - Provides info about columns (name, type, count)',
            'DatabaseMetaData - Provides info about the database itself (tables, driver version)',
            'setAutoCommit(false) - Disables auto-commit for manual transaction control',
            'commit() - Permanently saves changes made in the current transaction',
            'rollback() - Reverts changes made since the last commit',
            'Savepoint - Marks an intermediate point for partial rollback',
            'Batch processing - addBatch()/executeBatch() to run multiple statements efficiently',
            'Connection pooling - Reuses DB connections to avoid costly create/close overhead',
            'DataSource - Preferred way to obtain pooled connections (vs DriverManager)',
            'try-with-resources - Auto-closes Connection/Statement/ResultSet to prevent leaks',
            'SQLException - Checked exception thrown on database access errors',
            'getGeneratedKeys() - Retrieves auto-generated keys after an INSERT',
            'RowSet - Lightweight, JavaBean-friendly wrapper around ResultSet',
            'JNDI DataSource - Looks up a connection pool configured on an application server',
            'Statement.setFetchSize() - Controls rows fetched per DB round trip for performance',
            'Isolation levels - READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE'
        ],
        interviewQuestions: [
            {
                company: 'Infosys',
                questions: [
                    'What is JDBC and explain its architecture?',
                    'What is the difference between Statement and PreparedStatement?',
                    'How do you handle transactions in JDBC?',
                    'What are different types of JDBC drivers?',
                    'Explain connection pooling'
                ]
            }
        ]
    }
];
