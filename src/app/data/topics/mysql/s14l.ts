// Module 14 (Relationships & Database Design), part L: one-to-one design.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s14l: Record<string, DeepDive> = {
    'Designing One-to-One Tables': dd(
        [`A <b>one-to-one</b> relationship means each row in table A matches at most one row in table B, and the reverse. In MySQL you build it by making the child's foreign key also <b>UNIQUE</b> (or by making the foreign key the child's primary key).`,
            r`CREATE TABLE users (
  id    BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(120) NOT NULL UNIQUE
);
CREATE TABLE user_profiles (
  user_id BIGINT PRIMARY KEY,                 -- PK = FK, so at most one profile per user
  bio     VARCHAR(255),
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id)
);
INSERT INTO users (email) VALUES ('asha@example.com');
INSERT INTO user_profiles VALUES (1, 'Backend developer');
SELECT u.email, p.bio FROM users u JOIN user_profiles p ON p.user_id = u.id;

-- OUTPUT:
-- email            | bio
-- asha@example.com | Backend developer`],
        [`Why split one entity into two tables? To keep rarely used or large columns out of the hot table, to separate sensitive data for tighter permissions, or to model an optional extension that only some rows have.`,
            r`-- Hot table stays narrow and cache friendly; the heavy BLOB lives elsewhere
CREATE TABLE employee_photos (
  employee_id BIGINT PRIMARY KEY,
  photo       MEDIUMBLOB NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
SELECT e.name FROM employees e WHERE e.id = 7;    -- never reads the photo pages

-- OUTPUT:
-- name
-- Ravi        (photo bytes were not touched)`],
        [`Typical uses: user and profile, order and invoice, account and credentials, and subtype tables (a <code>vehicles</code> table plus <code>trucks</code> holding only truck columns). Optional sides are read with a LEFT JOIN.`,
            r`SELECT u.id, u.email, p.bio
FROM   users u
LEFT   JOIN user_profiles p ON p.user_id = u.id    -- profile may not exist yet
ORDER  BY u.id;

-- OUTPUT:
-- id | email            | bio
--  1 | asha@example.com | Backend developer
--  2 | ravi@example.com | NULL`],
        [`<b>Advantages:</b> the database itself guarantees the "only one" rule, wide or sensitive columns are isolated, and each table can have its own indexes, privileges and lifecycle.`,
            r`-- Least privilege: reporting can read users but never the credentials table
GRANT SELECT ON shop.users TO 'report_user'@'%';
-- credentials (password_hash) sit in a one-to-one table with no grant for report_user
SHOW GRANTS FOR 'report_user'@'%';

-- OUTPUT:
-- Grants for report_user@%
-- GRANT USAGE ON *.* TO report_user@%
-- GRANT SELECT ON shop.users TO report_user@%`],
        [`<b>Disadvantages:</b> every read of both halves needs a JOIN, inserts must create two rows (ideally in one transaction), and over-splitting a table that is always read whole only adds cost.`,
            r`START TRANSACTION;
INSERT INTO users (email) VALUES ('meena@example.com');
INSERT INTO user_profiles (user_id, bio) VALUES (LAST_INSERT_ID(), 'Data engineer');
COMMIT;                                            -- both rows or neither

-- OUTPUT:
-- Query OK, 1 row affected
-- Query OK, 1 row affected`],
        [`<b>Limitations:</b> MySQL cannot enforce that the child row <i>must</i> exist; a foreign key only stops a child without a parent. "Exactly one" on both sides needs application logic, a trigger, or merging the tables.`,
            r`-- The UNIQUE / PK on the child blocks a second profile for the same user
INSERT INTO user_profiles (user_id, bio) VALUES (1, 'Second profile');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1' for key 'user_profiles.PRIMARY'

-- But a user with NO profile is perfectly legal; the schema cannot forbid it.`],
        `
   users                     user_profiles
  ┌────────────┐  1 ─── 0..1 ┌────────────────┐
  │ id  (PK)   │◄────────────│ user_id (PK,FK)│   FK is also the PK  => one row max
  │ email      │             │ bio            │
  └────────────┘             └────────────────┘
   Alternative: user_id BIGINT UNIQUE NOT NULL + its own surrogate id
`,
        `Use a shared primary key (child PK = parent id) for true extensions; use a separate surrogate key plus UNIQUE FK when the child may be re-pointed or has its own references. If both sides are always created and read together, merge them into one table. Split only for a measurable reason: size, security, or optionality.`
    )
};
