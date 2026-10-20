import { describe, expect, it } from 'vitest';
import { canTryOnline } from './tryIt';

describe('canTryOnline', () => {
  it('keeps Try it for plain Java and Python samples', () => {
    expect(canTryOnline('public class A { public static void main(String[] a) { System.out.println(1); } }', 'java')).toBe(true);
    expect(canTryOnline('print("hi")', 'python')).toBe(true);
  });

  it('hides it for JavaFX, Spring and Hibernate courses', () => {
    expect(canTryOnline('Stage dialog = new Stage();', 'javafx')).toBe(false);
    expect(canTryOnline('@Service class A {}', 'spring-core')).toBe(false);
    expect(canTryOnline('class A {}', 'hibernate')).toBe(false);
  });

  it('hides it for Java samples that import libraries the compiler does not have', () => {
    expect(canTryOnline('import javafx.stage.Stage;\nclass A {}', 'java')).toBe(false);
    expect(canTryOnline('import org.springframework.stereotype.Service;\nclass A {}', 'design-patterns')).toBe(false);
    expect(canTryOnline('@Entity\nclass A {}', 'collection')).toBe(false);
  });

  it('keeps Try it for HTML samples even in framework courses', () => {
    expect(canTryOnline('<!DOCTYPE html><html><body><h1>Hi</h1></body></html>', 'angular')).toBe(true);
  });
});
