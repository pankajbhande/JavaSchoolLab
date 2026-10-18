// Module 39 (InnoDB Internals), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s39k: Record<string, DeepDive> = {
    'InnoDB Storage Engine': dd(
        [`<b>InnoDB</b> is MySQL's default transactional storage engine. It provides ACID transactions, row-level locking, MVCC, crash recovery and foreign keys. Data is stored in a clustered B+tree on the primary key.`,
            r`-- Confirm the default engine and a table's engine
SELECT @@default_storage_engine AS default_engine;
CREATE TABLE acct (id INT PRIMARY KEY, bal DECIMAL(10,2));
SELECT TABLE_NAME, ENGINE, ROW_FORMAT FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'acct';

-- OUTPUT:
-- +----------------+
-- | default_engine |
-- +----------------+
-- | InnoDB         |
-- +----------------+
-- +------------+--------+------------+
-- | TABLE_NAME | ENGINE | ROW_FORMAT |
-- +------------+--------+------------+
-- | acct       | InnoDB | Dynamic    |
-- +------------+--------+------------+`],
        [`Applications need transfers to be all-or-nothing, many sessions to work concurrently without blocking readers, and data to survive a power cut. MyISAM could not offer these; InnoDB does through redo/undo logs, locks and MVCC.`,
            r`-- Atomicity: a failed transfer leaves no half-applied state
INSERT INTO acct VALUES (1, 100.00), (2, 50.00);
START TRANSACTION;
UPDATE acct SET bal = bal - 30 WHERE id = 1;
UPDATE acct SET bal = bal + 30 WHERE id = 2;
ROLLBACK;                                    -- something failed: undo both
SELECT * FROM acct;

-- OUTPUT:
-- +----+--------+
-- | id | bal    |
-- +----+--------+
-- |  1 | 100.00 |
-- |  2 |  50.00 |
-- +----+--------+`],
        [`Every OLTP workload (e-commerce, banking, SaaS) runs on InnoDB. Key settings are the buffer pool size, log file capacity and the flush policy.`,
            r`# my.cnf essentials for a dedicated 32 GB server
[mysqld]
innodb_buffer_pool_size        = 22G     # cache for data and index pages
innodb_redo_log_capacity       = 8G      # MySQL 8.0.30+: total redo size
innodb_flush_log_at_trx_commit = 1       # fully durable commit (default)
innodb_file_per_table          = ON      # one .ibd per table
innodb_flush_method            = O_DIRECT

# OUTPUT:
# After restart: SHOW VARIABLES LIKE 'innodb_buffer_pool_size';  -> 23622320128`],
        [`<b>Advantages:</b> full ACID, row-level locking, non-blocking consistent reads, automatic crash recovery, foreign keys and online DDL for many operations.`,
            r`-- Row-level locks: two sessions can update different rows at the same time
-- session 1:
START TRANSACTION; UPDATE acct SET bal = bal + 1 WHERE id = 1;
-- session 2 (no waiting, different row):
START TRANSACTION; UPDATE acct SET bal = bal + 1 WHERE id = 2;

-- OUTPUT:
-- Query OK, 1 row affected   (session 1)
-- Query OK, 1 row affected   (session 2, not blocked)`],
        [`<b>Disadvantages:</b> more memory and disk overhead than simple engines, COUNT(*) must scan an index, tables are physically ordered by the primary key so a wide or random key hurts, and long transactions bloat undo.`,
            r`-- COUNT(*) is not O(1) in InnoDB (MVCC means each transaction may see a different count)
EXPLAIN SELECT COUNT(*) FROM acct;

-- OUTPUT (example, trimmed):
-- | table | type  | key     | rows | Extra       |
-- | acct  | index | PRIMARY | 2    | Using index |   <- walks the index`],
        [`<b>Limitations:</b> maximum row size is about half a page (8 KB for a 16 KB page, excluding off-page columns), at most 64 TB per tablespace, at most 1017 columns, and 16 columns in a composite index. The page size is fixed when the data directory is initialised.`,
            r`-- Page size is chosen at initialisation and cannot be changed later
SELECT @@innodb_page_size AS page_size;

-- OUTPUT:
-- +-----------+
-- | page_size |
-- +-----------+
-- |     16384 |
-- +-----------+`],
        `
   SQL layer ──► Handler API ──► InnoDB
                                  │
        ┌─────────────────────────┼──────────────────────────┐
        ▼                         ▼                          ▼
   Buffer Pool            Log subsystem               Locking / MVCC
   (cached pages)     redo log + undo logs        (row locks, read views)
        │                         │
        ▼                         ▼
   .ibd tablespaces      #innodb_redo / undo files
`,
        `InnoDB is the right default for nearly everything, so the architect's job is sizing: buffer pool for the working set, redo for write bursts, and a compact monotonic primary key. Treat the clustered index as the table itself, because every secondary index carries the primary key as its row pointer.`
    ),

    'Buffer Pool': dd(
        [`The <b>buffer pool</b> is InnoDB's in-memory cache of data and index pages. Reads hit memory first; modified ("dirty") pages are written to disk lazily. It is typically the single largest memory consumer of a MySQL server.`,
            r`-- How big is the pool, and how many pages does it hold?
SELECT @@innodb_buffer_pool_size / 1024 / 1024 AS pool_mb,
       @@innodb_buffer_pool_instances AS instances;

-- OUTPUT (example):
-- +---------+-----------+
-- | pool_mb | instances |
-- +---------+-----------+
-- | 22528   |         8 |
-- +---------+-----------+`],
        [`Disk is thousands of times slower than RAM. Caching hot pages turns most reads into memory hits and lets writes be batched, which is why a well-sized pool matters more than almost any other setting.`,
            r`-- Hit ratio: reads served from memory vs disk
SHOW GLOBAL STATUS WHERE Variable_name IN ('Innodb_buffer_pool_read_requests','Innodb_buffer_pool_reads');

-- OUTPUT (example):
-- +----------------------------------+-----------+
-- | Variable_name                    | Value     |
-- +----------------------------------+-----------+
-- | Innodb_buffer_pool_read_requests | 982341120 |   logical reads
-- | Innodb_buffer_pool_reads         |    412008 |   had to go to disk
-- +----------------------------------+-----------+
-- hit ratio = 1 - 412008/982341120 = 99.96%`],
        [`Rule of thumb: 50 to 75 percent of RAM on a dedicated server. The pool uses a midpoint-insertion LRU so one big table scan does not evict the hot working set. It can be resized online and warmed after restart.`,
            r`-- Resize online (in chunks), and save/restore the hot set across restarts
SET GLOBAL innodb_buffer_pool_size = 16 * 1024 * 1024 * 1024;
SET GLOBAL innodb_buffer_pool_dump_at_shutdown = ON;
SET GLOBAL innodb_buffer_pool_load_at_startup  = ON;
SHOW STATUS LIKE 'Innodb_buffer_pool_resize_status';

-- OUTPUT (example):
-- | Innodb_buffer_pool_resize_status | Completed resizing buffer pool at 261006 12:01:09. |`],
        [`<b>Advantages:</b> massive read speedup, write coalescing (many changes to one page, one flush), scan-resistant LRU, and warm restart.`,
            r`-- Which tables occupy the pool right now?
SELECT TABLE_NAME, COUNT(*) AS pages
FROM information_schema.INNODB_BUFFER_PAGE
WHERE TABLE_NAME IS NOT NULL
GROUP BY TABLE_NAME ORDER BY pages DESC LIMIT 3;   -- heavy query, avoid on busy production

-- OUTPUT (example):
-- +------------------+-------+
-- | TABLE_NAME       | pages |
-- +------------------+-------+
-- | shop/orders      | 41200 |
-- | shop/order_items | 38877 |
-- | shop/customers   |  9120 |
-- +------------------+-------+`],
        [`<b>Disadvantages:</b> after a restart the cache is cold unless dump/load is used; an over-large pool starves the OS and triggers swapping; a too-small pool causes constant disk reads.`,
            r`-- Dirty pages awaiting flush: high percentages signal write pressure
SELECT VARIABLE_VALUE AS dirty_pages FROM performance_schema.global_status
WHERE VARIABLE_NAME = 'Innodb_buffer_pool_pages_dirty';

-- OUTPUT (example):
-- +-------------+
-- | dirty_pages |
-- +-------------+
-- | 8213        |
-- +-------------+`],
        [`<b>Limitations:</b> it caches pages, not query results (the query cache was removed in 8.0), the working set must fit for good performance, and the size is rounded to a multiple of chunk size times instances.`,
            r`-- Size is rounded up to a multiple of chunk_size * instances
SET GLOBAL innodb_buffer_pool_size = 1000000000;
SELECT @@innodb_buffer_pool_size AS actual;

-- OUTPUT (example, chunk 128MB * 8 instances = 1 GB steps):
-- +------------+
-- | actual     |
-- +------------+
-- | 1073741824 |
-- +------------+`],
        `
   query ──► find page in Buffer Pool?
              │ yes ──► return (memory speed)
              │ no  ──► read from .ibd ──► place at MIDPOINT of LRU
        ┌────────────────── LRU list ──────────────────┐
        │ young (hot, 5/8)      │ midpoint │ old (3/8) │
        └───────────────────────┴──────────┴───────────┘
        modified page = dirty ──► flush list ──► background write to disk
`,
        `Size the pool to hold the hot working set and monitor the hit ratio, dirty-page percentage and read-ahead, not just raw size. On large servers use multiple instances to reduce mutex contention, keep dump/load on for fast warm-up, and leave headroom for per-connection buffers and the OS cache.`
    ),

    'Redo Log & Undo Log': dd(
        [`The <b>redo log</b> records physical changes so committed data survives a crash (durability and replay). The <b>undo log</b> stores the previous version of changed rows so a transaction can roll back and so other transactions can read old versions (MVCC). Redo moves forward, undo moves backward.`,
            r`-- Redo configuration and durability policy (MySQL 8.0.30+)
SELECT @@innodb_redo_log_capacity / 1024 / 1024 AS redo_mb,
       @@innodb_flush_log_at_trx_commit        AS flush_policy;

-- OUTPUT (example):
-- +---------+--------------+
-- | redo_mb | flush_policy |
-- +---------+--------------+
-- |    100  |            1 |
-- +---------+--------------+`],
        [`Writing every dirty data page to disk at commit would be slow and random. Instead InnoDB appends a small sequential redo record at commit and flushes pages later. After a crash it replays redo to recover; undo rolls back transactions that never committed.`,
            r`-- Write-ahead logging in one picture (conceptual log of what happens on COMMIT)
START TRANSACTION;
UPDATE acct SET bal = bal - 30 WHERE id = 1;
-- 1) old value copied to UNDO       2) page changed in buffer pool (dirty)
-- 3) change written to REDO buffer
COMMIT;                                       -- 4) redo flushed + fsync (policy 1)
-- data page itself is written to disk later by a background flush

-- OUTPUT:
-- Query OK, 1 row affected
-- Query OK (commit durable once redo is fsynced)`],
        [`Redo capacity governs write bursts: if it fills, InnoDB must flush aggressively (checkpoint stalls). Undo is used by rollback, by consistent reads and by purge, so long transactions keep old versions alive.`,
            r`-- Spot long transactions that hold undo history
SELECT trx_id, trx_started, TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS age_s
FROM information_schema.INNODB_TRX ORDER BY trx_started LIMIT 3;

-- History list length: how much undo purge has not yet cleaned
SELECT COUNT AS history_list_length FROM information_schema.INNODB_METRICS
WHERE NAME = 'trx_rseg_history_len';

-- OUTPUT (example):
-- | 5128901 | 2026-10-06 08:00:11 | 7200 |
-- | history_list_length | 840221 |   <- large value = purge is behind`],
        [`<b>Advantages:</b> fast sequential commits, crash safety, instant rollback, and non-blocking reads through undo-based old versions.`,
            r`-- Rollback uses undo to restore the old value
START TRANSACTION;
UPDATE acct SET bal = 0 WHERE id = 1;
ROLLBACK;
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT:
-- +--------+
-- | bal    |
-- +--------+
-- | 100.00 |
-- +--------+`],
        [`<b>Disadvantages:</b> every commit with policy 1 pays an fsync; huge transactions generate huge undo and redo; long-running transactions prevent purge and bloat the undo tablespace.`,
            r`-- Trade durability for speed (risk: up to 1 second of commits lost on OS crash)
SET GLOBAL innodb_flush_log_at_trx_commit = 2;
SET GLOBAL sync_binlog = 0;
SELECT @@innodb_flush_log_at_trx_commit AS flush_policy;

-- OUTPUT:
-- +--------------+
-- | flush_policy |
-- +--------------+
-- |            2 |
-- +--------------+`],
        [`<b>Limitations:</b> redo is circular and fixed in size (resizable online since 8.0.30), undo space is shared by all transactions, and the redo log cannot repair corruption of already-written bad data; it only guarantees committed changes.`,
            r`-- Resize redo online in 8.0.30+
SET GLOBAL innodb_redo_log_capacity = 8 * 1024 * 1024 * 1024;
SHOW STATUS LIKE 'Innodb_redo_log_capacity_resized';

-- OUTPUT (example):
-- | Innodb_redo_log_capacity_resized | 8589934592 |`],
        `
   UPDATE ──► 1. copy old row ──► UNDO log   (rollback + old versions for readers)
         └──► 2. change page   ──► Buffer Pool (dirty)
         └──► 3. append record ──► REDO log buffer
   COMMIT ──► 4. fsync redo   ──► durable
   later  ──► 5. checkpoint: dirty page ──► .ibd, redo space reusable

   crash recovery:  REDO replays committed work forward;  UNDO rolls back the uncommitted
`,
        `Size redo to absorb about an hour of peak write volume so checkpointing never stalls writers, and keep innodb_flush_log_at_trx_commit=1 with sync_binlog=1 wherever data loss is unacceptable. Watch history list length: it is the earliest warning that a long transaction or lagging purge is accumulating undo.`
    ),

    'Doublewrite Buffer & Change Buffer': dd(
        [`The <b>doublewrite buffer</b> protects against torn pages: a 16 KB page write can be interrupted halfway by a crash, leaving a corrupt page. InnoDB first writes pages to a doublewrite area, then to their real location. The <b>change buffer</b> caches modifications to secondary-index pages that are not in memory, merging them later to avoid random reads.`,
            r`-- Both are on by default
SELECT @@innodb_doublewrite AS doublewrite, @@innodb_change_buffering AS change_buffering,
       @@innodb_change_buffer_max_size AS cb_max_pct;

-- OUTPUT (example):
-- +-------------+------------------+------------+
-- | doublewrite | change_buffering | cb_max_pct |
-- +-------------+------------------+------------+
-- | ON          | all              |         25 |
-- +-------------+------------------+------------+`],
        [`Redo replay needs an intact base page; a half-written page cannot be repaired from redo alone, so doublewrite supplies a good copy. Change buffering avoids a random disk read for every secondary-index insert on cold pages.`,
            r`-- Doublewrite activity: pages written vs doublewrite operations
SHOW GLOBAL STATUS LIKE 'Innodb_dblwr%';

-- OUTPUT (example):
-- +----------------------------+--------+
-- | Variable_name              | Value  |
-- +----------------------------+--------+
-- | Innodb_dblwr_pages_written | 982110 |
-- | Innodb_dblwr_writes        |  41200 |   (about 24 pages per batch)
-- +----------------------------+--------+`],
        [`Bulk inserts into tables with many secondary indexes benefit most from the change buffer. In MySQL 8.0.20+ the doublewrite files are separate (#ib_16384_0.dblwr), and on filesystems or hardware with atomic writes it can be disabled.`,
            r`-- Change buffer merge counters from InnoDB metrics
SELECT NAME, COUNT FROM information_schema.INNODB_METRICS
WHERE NAME LIKE 'ibuf_merge%' AND STATUS = 'enabled';

-- OUTPUT (example):
-- +--------------------+--------+
-- | NAME               | COUNT  |
-- +--------------------+--------+
-- | ibuf_merges        | 180442 |
-- | ibuf_merges_insert | 176300 |
-- +--------------------+--------+`],
        [`<b>Advantages:</b> doublewrite gives safe recovery without special hardware; change buffer cuts random I/O and speeds write-heavy secondary-index workloads.`,
            r`-- Change buffer holds work for pages not in memory: see its size in the status output
SHOW ENGINE INNODB STATUS\G
-- INSERT BUFFER AND ADAPTIVE HASH INDEX section

-- OUTPUT (example, trimmed):
-- Ibuf: size 1, free list len 612, seg size 614, 180442 merges
-- merged operations: insert 176300, delete mark 4100, delete 42`],
        [`<b>Disadvantages:</b> doublewrite writes every page twice (extra I/O, though sequential); a large change buffer lengthens crash recovery and can slow reads that must merge pending changes.`,
            r`-- Disabling change buffering for SSD-heavy, read-latency-sensitive workloads
SET GLOBAL innodb_change_buffering = 'none';
SELECT @@innodb_change_buffering AS mode;

-- OUTPUT:
-- +------+
-- | mode |
-- +------+
-- | none |
-- +------+`],
        [`<b>Limitations:</b> change buffering applies only to non-unique secondary indexes (uniqueness must be checked immediately, requiring the page), and neither structure helps the clustered index. Disabling doublewrite is unsafe without atomic writes.`,
            r`-- Unique secondary index: inserts cannot be deferred, the page must be read to check uniqueness
CREATE TABLE u (id INT PRIMARY KEY, email VARCHAR(50), UNIQUE KEY (email));
INSERT INTO u VALUES (1,'a@x.com');
INSERT INTO u VALUES (2,'a@x.com');

-- OUTPUT:
-- Query OK, 1 row affected
-- ERROR 1062 (23000): Duplicate entry 'a@x.com' for key 'u.email'`],
        `
   Torn-page protection                   Secondary index write optimisation
   dirty page ──► doublewrite area         INSERT, leaf page not cached
              │   (sequential, fsync)         │
              ▼                               ▼
          real location in .ibd         record change in CHANGE BUFFER
   crash mid-write? -> restore page        later page is read ──► changes MERGED
   from doublewrite copy, then apply redo
`,
        `Keep doublewrite on unless storage guarantees atomic 16 KB writes. For SSD or NVMe fleets with mostly unique or read-latency-critical indexes, benchmark innodb_change_buffering=none; otherwise leave the default. Neither is a tuning knob you reach for first, but both explain surprising I/O patterns during incident analysis.`
    ),

    'Adaptive Hash Index': dd(
        [`The <b>Adaptive Hash Index (AHI)</b> is an in-memory hash table that InnoDB builds automatically over B+tree index pages that are accessed frequently, turning an O(log n) B-tree descent into an O(1) hash lookup for equality searches. You do not create or choose it.`,
            r`-- Is it on, and how many partitions does it use?
SELECT @@innodb_adaptive_hash_index AS ahi, @@innodb_adaptive_hash_index_parts AS parts;

-- OUTPUT:
-- +-----+-------+
-- | ahi | parts |
-- +-----+-------+
-- |   1 |     8 |
-- +-----+-------+`],
        [`Hot point lookups repeat the same tree traversal thousands of times per second. Caching the path as a hash cuts CPU and page accesses without any application change.`,
            r`-- Hash searches vs ordinary B-tree searches
SELECT NAME, COUNT FROM information_schema.INNODB_METRICS
WHERE NAME IN ('adaptive_hash_searches','adaptive_hash_searches_btree');

-- OUTPUT (example):
-- +------------------------------+-----------+
-- | NAME                         | COUNT     |
-- +------------------------------+-----------+
-- | adaptive_hash_searches       | 812334019 |
-- | adaptive_hash_searches_btree | 120554331 |
-- +------------------------------+-----------+
-- about 87% of searches were answered by the hash`],
        [`Workloads with many repeated equality lookups on a hot set (key-value-like tables) benefit; scan-heavy or highly concurrent write workloads often see mutex contention, so many teams turn it off.`,
            r`-- Toggle dynamically to test its effect
SET GLOBAL innodb_adaptive_hash_index = OFF;
SELECT @@innodb_adaptive_hash_index AS ahi;

-- OUTPUT:
-- +-----+
-- | ahi |
-- +-----+
-- |   0 |
-- +-----+`],
        [`<b>Advantages:</b> automatic, no storage on disk, faster equality lookups on hot data, and it self-adapts to the access pattern.`,
            r`-- Benefit shows as ratio of hash hits in SHOW ENGINE INNODB STATUS
SHOW ENGINE INNODB STATUS\G

-- OUTPUT (example, trimmed):
-- Hash table size 553253, used cells 120331
-- 8231.12 hash searches/s, 1102.40 non-hash searches/s`],
        [`<b>Disadvantages:</b> consumes buffer pool memory, is protected by latches that can become a bottleneck under heavy concurrency, and must be maintained as pages change or are evicted.`,
            r`-- Contention shows up as waits on the AHI latch (btr_search)
SELECT EVENT_NAME, COUNT_STAR FROM performance_schema.events_waits_summary_global_by_event_name
WHERE EVENT_NAME LIKE '%btr_search%' ORDER BY COUNT_STAR DESC LIMIT 2;

-- OUTPUT (example):
-- +------------------------------------+------------+
-- | EVENT_NAME                         | COUNT_STAR |
-- +------------------------------------+------------+
-- | wait/synch/sxlock/innodb/btr_search_latch | 9120331 |
-- +------------------------------------+------------+`],
        [`<b>Limitations:</b> equality predicates and prefix matches only (no range scans or ORDER BY help), it cannot be forced for a specific query, and it is lost on restart because it lives only in memory.`,
            r`-- A range predicate cannot use the hash
EXPLAIN SELECT * FROM acct WHERE id BETWEEN 1 AND 10;

-- OUTPUT (example, trimmed):
-- | type  | key     | rows |
-- | range | PRIMARY | 2    |    <- served by B-tree range scan, not the hash`],
        `
   WHERE id = 42
        │
        ├─ hash lookup(42) ─► page address ──► row         (AHI hit: O(1))
        │
        └─ miss ─► B+tree descent: root ─► branch ─► leaf   (O(log n))
   AHI is built on demand for hot pages, lives in the buffer pool memory
`,
        `Leave AHI at its default, then measure: on read-mostly, equality-heavy services it is free speed; on write-heavy or highly parallel workloads, A/B test it off and compare throughput and latch waits. Treat it as an optimization you validate, never as a design assumption.`
    ),

    'Tablespaces, Data Pages & Index Pages': dd(
        [`InnoDB stores data in <b>tablespaces</b> (files). A tablespace is divided into <b>extents</b> (1 MB) of <b>pages</b> (16 KB by default). Each table's rows live in the leaf pages of its clustered index (data pages); each secondary index has its own B+tree of index pages.`,
            r`-- Tablespace layout settings and the files on disk
SELECT @@innodb_file_per_table AS file_per_table, @@innodb_page_size AS page_size;
SELECT SPACE, NAME, FILE_SIZE / 1024 / 1024 AS mb
FROM information_schema.INNODB_TABLESPACES WHERE NAME LIKE 'shop/%' LIMIT 3;

-- OUTPUT (example):
-- +----------------+-----------+
-- | file_per_table | page_size |
-- +----------------+-----------+
-- |              1 |     16384 |
-- +----------------+-----------+
-- | SPACE | NAME        | mb   |
-- |    12 | shop/orders | 96.0 |`],
        [`Understanding pages explains why a random UUID primary key fragments the table, why wide rows reduce cache efficiency, and why reading one row costs a whole 16 KB page I/O.`,
            r`-- How many rows fit on a page? Roughly 16384 / row_size, minus overhead.
-- Check actual index sizes in pages:
SELECT INDEX_NAME, STAT_VALUE AS pages
FROM mysql.innodb_index_stats
WHERE DATABASE_NAME='shop' AND TABLE_NAME='orders' AND STAT_NAME='size';

-- OUTPUT (example):
-- +-------------+-------+
-- | INDEX_NAME  | pages |
-- +-------------+-------+
-- | PRIMARY     |  6144 |    6144 pages * 16 KB = 96 MB
-- | idx_cust    |  1100 |
-- +-------------+-------+`],
        [`Admins use file-per-table so a table can be dropped to reclaim space, general tablespaces to group tables, and separate undo tablespaces. Moving a table to different storage is done with tablespace options.`,
            r`-- General tablespace shared by several tables; file placed explicitly
CREATE TABLESPACE ts_hot ADD DATAFILE 'ts_hot.ibd' ENGINE=InnoDB;
CREATE TABLE hot_events (id INT PRIMARY KEY, payload VARCHAR(100)) TABLESPACE ts_hot;
SELECT TABLE_NAME, TABLESPACE_NAME FROM information_schema.TABLES WHERE TABLE_NAME='hot_events';

-- OUTPUT:
-- +------------+-----------------+
-- | TABLE_NAME | TABLESPACE_NAME |
-- +------------+-----------------+
-- | hot_events | ts_hot          |
-- +------------+-----------------+`],
        [`<b>Advantages:</b> file-per-table gives easy space reclaim and per-table backup or transport; the clustered layout makes primary-key range scans sequential; 16 KB pages balance I/O size and fan-out.`,
            r`-- Fan-out: with 16 KB pages and a 8-byte key, ~1000 children per branch page
-- so a 3-level tree can index about 1000 * 1000 * ~100 rows per leaf = 100,000,000 rows
SELECT FLOOR(16384 / (8 + 6)) AS approx_children_per_page;   -- key 8 bytes + pointer 6 bytes

-- OUTPUT:
-- +--------------------------+
-- | approx_children_per_page |
-- +--------------------------+
-- |                     1170 |
-- +--------------------------+`],
        [`<b>Disadvantages:</b> deleted rows leave free space in pages that is not returned to the OS until you rebuild; random primary keys cause page splits and about 30 percent wasted space; many small tablespace files increase file handle use.`,
            r`-- Reclaim space after large deletes by rebuilding the table
OPTIMIZE TABLE orders;          -- for InnoDB this is a recreate + analyze

-- OUTPUT:
-- +-------------+----------+----------+-------------------------------------------------------------------+
-- | Table       | Op       | Msg_type | Msg_text                                                          |
-- +-------------+----------+----------+-------------------------------------------------------------------+
-- | shop.orders | optimize | note     | Table does not support optimize, doing recreate + analyze instead |
-- | shop.orders | optimize | status   | OK                                                                |
-- +-------------+----------+----------+-------------------------------------------------------------------+`],
        [`<b>Limitations:</b> page size is fixed per instance, a row cannot exceed about 8 KB on-page (large values move to overflow pages), and a tablespace cannot shrink in place. The system tablespace ibdata1 never shrinks.`,
            r`-- A row of many large VARCHARs may be rejected when the on-page part is too big
CREATE TABLE wide (
  a VARCHAR(4000), b VARCHAR(4000), c VARCHAR(4000), d VARCHAR(4000)
) ROW_FORMAT = COMPACT CHARACTER SET latin1;

-- OUTPUT (example):
-- ERROR 1118 (42000): Row size too large (> 8126). Changing some columns to TEXT or BLOB
-- may help. In current row format, BLOB prefix of 768 bytes is stored inline.`],
        `
   Tablespace (.ibd)
   └─ Segments (leaf / non-leaf per index)
       └─ Extent = 64 pages = 1 MB
           └─ Page = 16 KB
               ┌────────────────────────────────────────────┐
               │ header │ rows... ► free space ◄ │ dir │ trl │
               └────────────────────────────────────────────┘
   B+tree:         [root page]
                  /     |      \
          [branch]  [branch]  [branch]
          / | \               leaf pages hold full rows (clustered) or key+PK (secondary)
`,
        `Use a compact, monotonically increasing primary key (BIGINT auto-increment, or time-ordered ids) to fill pages sequentially and avoid splits, and remember secondary indexes store the primary key, so a fat primary key bloats every index. Keep file-per-table on, plan rebuilds off-peak, and monitor free space per tablespace.`
    )
};
