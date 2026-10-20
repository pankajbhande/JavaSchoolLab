import { describe, expect, it } from 'vitest';
import { commentJava } from './commentJava';

describe('commentJava', () => {
  it('comments every statement of a small program and aligns the comments', () => {
    const out = commentJava(`import java.util.ArrayList;

public class Demo {
    public static void main(String[] args) {
        ArrayList<String> names = new ArrayList<>();
        names.add("Asha");
        System.out.println(names.size());
    }
}`);
    expect(out).toContain('import java.util.ArrayList;  // imports the ArrayList class');
    expect(out).toMatch(/new ArrayList<>\(\);\s+\/\/ creates an empty ArrayList named names/);
    expect(out).toMatch(/names\.add\("Asha"\);\s+\/\/ adds "Asha" to the end of the list/);
    expect(out).toMatch(/System\.out\.println\(names\.size\(\)\);\s+\/\/ prints the number of elements/);
    const cols = out.split('\n').filter(l => l.includes('//') && !l.trim().startsWith('//')).map(l => l.indexOf('//'));
    const inBody = cols.slice(-3);
    expect(new Set(inBody).size).toBe(1);   // the three statements of main share one comment column
  });

  it('keeps existing comments and is idempotent', () => {
    const src = `List<String> a = new ArrayList<>(); // my own note
a.add("x");
// OUTPUT:
// [x]`;
    const once = commentJava(src);
    expect(once).toContain('// my own note');
    expect(once).toContain('// OUTPUT:');
    expect(commentJava(once)).toBe(once);
  });

  it('expands one-line if / for / while into braces with consistent indentation', () => {
    const out = commentJava(`Iterator<Integer> it = nums.iterator();
while (it.hasNext()) if (it.next() == 5) it.remove();`);
    expect(out).toMatch(/while \(it\.hasNext\(\)\) \{/);
    expect(out).toMatch(/\n {4}if \(it\.next\(\) == 5\) \{/);
    expect(out).toMatch(/\n {8}it\.remove\(\);/);
    expect(out.split('\n').filter(l => l.trim() === '}').length).toBe(2);
  });

  it('splits several statements written on one line', () => {
    const out = commentJava('Set<String> s = new HashSet<>(); s.add("a"); s.add("a");');
    expect(out.split('\n').length).toBe(3);
  });

  it('leaves non-Java samples alone', () => {
    const html = '<table><tr><td>x</td></tr></table>';
    expect(commentJava(html)).toBe(html);
  });

  it('does not touch text inside strings or block comments', () => {
    const src = `/* a note; with a semicolon */
String url = "http://example.com";
System.out.println(url);`;
    const out = commentJava(src);
    expect(out).toContain('/* a note; with a semicolon */');
    expect(out).toContain('"http://example.com"');
  });
});
