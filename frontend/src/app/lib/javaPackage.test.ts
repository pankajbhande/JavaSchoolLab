import { describe, it, expect } from 'vitest';
import { packageName, withJavaPackage, isJavaProgram, stripPackage } from './javaPackage';

describe('packageName', () => {
  it('builds com.javaschoollab.<course>.<topic>', () => {
    expect(packageName('java', 'operators')).toBe('com.javaschoollab.java.operators');
    expect(packageName('spring-boot', 'Spring Boot Intro')).toBe('com.javaschoollab.springboot.springbootintro');
  });
  it('keeps every segment a valid identifier', () => {
    expect(packageName('java', '3d-arrays')).toBe('com.javaschoollab.java.t3darrays');
    expect(packageName('java', 'switch')).toBe('com.javaschoollab.java.switch_');
    expect(packageName('java', '---')).toBe('com.javaschoollab.java.topic');
  });
});

describe('withJavaPackage', () => {
  const prog = 'public class Hi {\n    public static void main(String[] a) {\n        System.out.println("x");\n    }\n}';

  it('adds the package to a full program', () => {
    expect(withJavaPackage(prog, 'java', 'operators')).toBe('package com.javaschoollab.java.operators;\n\n' + prog);
  });
  it('goes after a leading comment header and before imports', () => {
    const out = withJavaPackage('// Hello.java\nimport java.util.*;\n' + prog, 'java', 'x');
    expect(out.split('\n').slice(0, 4)).toEqual(['// Hello.java', 'package com.javaschoollab.java.x;', '', 'import java.util.*;']);
  });
  it('skips a leading block comment', () => {
    const out = withJavaPackage('/* header\n   more */\n' + prog, 'java', 'x');
    expect(out).toContain('more */\npackage com.javaschoollab.java.x;\n\npublic class Hi');
  });
  it('only applies to Java courses', () => {
    expect(withJavaPackage(prog, 'angular', 'x')).toBe(prog);
    expect(withJavaPackage(prog, 'spring-boot', 'x')).toContain('package com.javaschoollab.springboot.x;');
  });
  it('leaves fragments and other languages alone', () => {
    for (const c of ['int a = 10;\nSystem.out.println(a);', 'SELECT * FROM users;', 'const a = 1;\nclass A {}', '<div class="x"></div>', 'def f():\n    return 1']) {
      expect(withJavaPackage(c, 'java', 'x')).toBe(c);
    }
  });
  it('does not add a second package', () => {
    const c = 'package app;\n' + prog;
    expect(withJavaPackage(c, 'java', 'x')).toBe(c);
    expect(isJavaProgram(c)).toBe(false);
  });
  it('handles interfaces, enums, records and annotations', () => {
    for (const c of ['interface A { void f(); }', 'enum Color { RED, GREEN }', 'record P(int x) {}', '@FunctionalInterface\ninterface F { void run(); }']) {
      expect(isJavaProgram(c)).toBe(true);
    }
  });
});

describe('stripPackage', () => {
  it('removes the declaration for the online compiler', () => {
    expect(stripPackage('package a.b;\n\nclass A {}')).toBe('\nclass A {}');
    expect(stripPackage('class A {}')).toBe('class A {}');
  });
});
