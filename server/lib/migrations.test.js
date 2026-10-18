import { describe, it, expect } from 'vitest';
import { migrationFiles, prepareSql, checksum, isSafeDatabaseName } from './migrations.js';

describe('migrationFiles', () => {
  it('keeps only numbered .sql files, in order', () => {
    expect(migrationFiles(['005_b.sql', 'notes.md', '000_base.sql', '010_c.sql', '001_a.sql']))
      .toEqual(['000_base.sql', '001_a.sql', '005_b.sql', '010_c.sql']);
  });
});

describe('prepareSql', () => {
  it('removes USE lines but keeps everything else', () => {
    const sql = '-- note\nUSE javaschoollab;\nCREATE TABLE t (id INT);\n';
    expect(prepareSql(sql)).toBe('-- note\nCREATE TABLE t (id INT);\n');
  });
  it('handles CRLF and backticked names', () => {
    expect(prepareSql('USE `mydb`;\r\nSELECT 1;')).toBe('SELECT 1;');
  });
  it('does not touch the word "use" inside a comment or statement', () => {
    const sql = '-- we use javaschoollab here\nSELECT 1;';
    expect(prepareSql(sql)).toBe(sql);
  });
});

describe('checksum', () => {
  it('is stable across line endings', () => {
    expect(checksum('a\nb')).toBe(checksum('a\r\nb'));
  });
  it('changes when the content changes', () => {
    expect(checksum('a')).not.toBe(checksum('b'));
  });
});

describe('isSafeDatabaseName', () => {
  it('accepts plain names and rejects anything that could break out of the statement', () => {
    expect(isSafeDatabaseName('javaschoollab')).toBe(true);
    expect(isSafeDatabaseName('jsl_prod_2')).toBe(true);
    expect(isSafeDatabaseName('a`; DROP DATABASE x; --')).toBe(false);
    expect(isSafeDatabaseName('')).toBe(false);
  });
});
