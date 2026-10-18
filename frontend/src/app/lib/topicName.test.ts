import { describe, it, expect } from 'vitest';
import { displayTopicName } from './topicName';

describe('displayTopicName', () => {
  it('drops a trailing course name that context already implies', () => {
    expect(displayTopicName('Introduction to Java', 'Java')).toBe('Introduction');
    expect(displayTopicName('Features of Java', 'Java')).toBe('Features');
    expect(displayTopicName('Operators in Java', 'Java')).toBe('Operators');
    expect(displayTopicName('Control Statements in Java', 'Java')).toBe('Control Statements');
    expect(displayTopicName('Array in Java', 'Java')).toBe('Array');
  });

  it('leaves the name alone when the course name is not trailing', () => {
    expect(displayTopicName('Java Buzzwords', 'Java')).toBe('Java Buzzwords');
    expect(displayTopicName('Java 8 Features', 'Java')).toBe('Java 8 Features');
    expect(displayTopicName('Difference between JVM, JDK, JRE', 'Java')).toBe('Difference between JVM, JDK, JRE');
  });

  it('does not strip when the remainder would be too short to read', () => {
    // Two characters is not a readable list entry; three ('Set') is.
    expect(displayTopicName('IO in Java', 'Java')).toBe('IO in Java');
    expect(displayTopicName('Set in Java', 'Java')).toBe('Set');
  });

  it('handles course-name aliases', () => {
    expect(displayTopicName('Introduction to React', 'ReactJS')).toBe('Introduction');
    expect(displayTopicName('Components in React', 'ReactJS')).toBe('Components');
  });

  it('leaves a parenthetical suffix alone rather than mangling it', () => {
    expect(displayTopicName('Getting Started with Java (Installation)', 'Java'))
      .toBe('Getting Started with Java (Installation)');
  });

  it('is a no-op without a course', () => {
    expect(displayTopicName('Operators in Java', null)).toBe('Operators in Java');
    expect(displayTopicName('Operators in Java')).toBe('Operators in Java');
  });
});
