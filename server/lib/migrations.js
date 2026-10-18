import { createHash } from 'node:crypto';

// Migration files run in filename order: 000_..., 001_..., and so on.
export function migrationFiles(names) {
  return names.filter(n => /^\d+_.+\.sql$/.test(n)).sort();
}

// The files were written for one fixed database name ("USE javaschoollab;" and a literal TABLE_SCHEMA).
// The runner connects to DB_NAME itself, so a USE line would send the statements to the wrong database
// whenever DB_NAME differs. Drop the line; statements then run against the connected database.
export function prepareSql(sql) {
  return sql.replace(/^\s*USE\s+`?\w+`?\s*;[ \t]*\r?\n?/gim, '');
}

export function checksum(sql) {
  return createHash('sha256').update(sql.replace(/\r\n/g, '\n')).digest('hex');
}

// A database name goes into CREATE DATABASE, which cannot take a bound parameter.
export function isSafeDatabaseName(name) {
  return /^[A-Za-z0-9_]{1,64}$/.test(name);
}
