// Applies server/migrations/*.sql to the database named by DB_NAME, once each, in order.
//
//   npm run migrate            apply anything not yet applied
//   npm run migrate -- --status  list applied and pending migrations, change nothing
//
// Applied migrations are recorded in the schema_migrations table, so running this on every deploy is
// safe: it only does work when a new file appears. Registered users live in the database, not in the
// app container, so redeploying the app never touches them; this script is the only thing that changes
// the schema. It reads the same DB_* variables as the API (server/.env or the environment).
import fs from 'node:fs';
import mysql from 'mysql2/promise';
import { migrationFiles, prepareSql, checksum, isSafeDatabaseName } from './lib/migrations.js';

try { process.loadEnvFile(new URL('.env', import.meta.url)); } catch { /* no .env: use the environment */ }

const statusOnly = process.argv.includes('--status');
const dbName = process.env.DB_NAME || 'javaschoollab';
const dir = new URL('./migrations/', import.meta.url);

if (!isSafeDatabaseName(dbName)) {
  console.error(`DB_NAME "${dbName}" is not a valid database name (letters, digits and underscore only).`);
  process.exit(1);
}

const conn = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

async function connect() {
  // Create the database first when the account is allowed to; hosted MySQL usually provides it already,
  // in which case this is skipped or refused and the connect below simply succeeds.
  if (!statusOnly) {
    try {
      const root = await mysql.createConnection(conn);
      await root.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4`);
      await root.end();
    } catch (e) {
      console.warn(`Skipping CREATE DATABASE (${e.code || e.message}); assuming "${dbName}" already exists.`);
    }
  }
  // multipleStatements: the files hold several statements, including SET/PREPARE/EXECUTE blocks.
  return mysql.createConnection({ ...conn, database: dbName, multipleStatements: true });
}

const db = await connect().catch(e => {
  console.error(`Cannot connect to MySQL at ${conn.host}:${conn.port} as ${conn.user}: ${e.code || e.message}`);
  process.exit(1);
});

try {
  await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name       VARCHAR(255) PRIMARY KEY,
    checksum   CHAR(64) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  const [rows] = await db.query('SELECT name, checksum FROM schema_migrations');
  const applied = new Map(rows.map(r => [r.name, r.checksum]));
  const files = migrationFiles(fs.readdirSync(dir));
  let ran = 0;

  for (const name of files) {
    const raw = fs.readFileSync(new URL(name, dir), 'utf8');
    if (applied.has(name)) {
      if (applied.get(name) !== checksum(raw)) console.warn(`! ${name} changed after it was applied; edit nothing already deployed, add a new migration instead.`);
      if (statusOnly) console.log(`  applied  ${name}`);
      continue;
    }
    if (statusOnly) { console.log(`  pending  ${name}`); continue; }
    process.stdout.write(`  applying ${name} ... `);
    try {
      await db.query(prepareSql(raw));
      await db.query('INSERT INTO schema_migrations (name, checksum) VALUES (?, ?)', [name, checksum(raw)]);
      console.log('done');
      ran++;
    } catch (e) {
      console.log('FAILED');
      console.error(`${name}: ${e.sqlMessage || e.message}`);
      process.exitCode = 1;
      break; // later files may depend on this one
    }
  }
  if (!statusOnly && !process.exitCode) console.log(ran ? `Applied ${ran} migration(s) to "${dbName}".` : `"${dbName}" is up to date.`);
} finally {
  await db.end();
}
