#!/usr/bin/env python3
"""Builds a Collection Framework lesson from its spec and VERIFIES every code sample by running it.

    python build.py arraylist            # builds src/app/data/collection/arraylist.ts
    python build.py all                  # builds every spec in specs/

A spec (specs/<name>.py) defines TOPIC = {id, name, beginner, intermediate, expert, qa}. Code samples are full Java programs; a line
`// OUTPUT: @auto` at the end of a sample is replaced by the real, captured program output (one `// ...` line per output line), so
the lesson can never show output that the code does not produce. Requires a JDK 21+ on PATH (`java File.java` source launcher).
"""
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.normpath(os.path.join(HERE, '..', '..', 'src', 'app', 'data', 'collection'))
AUTO = '// OUTPUT: @auto'
INTRO = ('<h3>Practice questions</h3>\n<p>Now test yourself. Each question is harder than the examples above: read the problem, '
         'write your own solution, then compare it with the one shown. Every solution was compiled and run, and its output is real.</p>')


def run_java(code: str, name: str) -> str:
    """Runs one program with the single-file source launcher and returns its stdout (stderr is an error)."""
    cls = re.search(r'public\s+class\s+(\w+)', code)
    if not cls:
        raise SystemExit(f'[{name}] sample has no public class')
    with tempfile.TemporaryDirectory() as d:
        path = os.path.join(d, cls.group(1) + '.java')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(code.replace(AUTO, '// (output captured by build.py)'))
        r = subprocess.run(['java', '-Xshare:auto', path], capture_output=True, text=True, timeout=60)
        if r.returncode != 0:
            raise SystemExit(f'[{name}] FAILED to run:\n{r.stderr}\n--- code ---\n{code}')
        return r.stdout.rstrip('\n')


def with_output(code: str, name: str) -> str:
    if AUTO not in code:
        run_java(code, name)          # still compile/run to prove it works
        return code
    out = run_java(code, name)
    lines = out.split('\n') if out else ['(no output)']
    block = '// OUTPUT:\n' + '\n'.join('// ' + l if l else '//' for l in lines)
    return code.replace(AUTO, block)


def number_headings(blocks):
    """Puts a running count before every method name ("1. add(E e)") and before every practice program."""
    m = p = 0
    out = []
    for b in blocks:
        content = b[0]
        if '<h3 class="mcard">' in content:
            m += 1
            content = content.replace('<h3 class="mcard">', f'<h3>{m}. ', 1)
        elif '<h3 class="practice">' in content:
            p += 1
            content = content.replace('<h3 class="practice">', f'<h3>Practice question {p}: ', 1)
        out.append((content, *b[1:]))
    return out


def process_blocks(blocks, name):
    done = []
    for i, b in enumerate(number_headings(blocks)):
        content, codes = b[0], b[1] if len(b) > 1 else []
        new_codes = [with_output(c, f'{name} block {i} sample {j}') for j, c in enumerate(codes)]
        entry = {'content': content}
        if new_codes:
            entry['codeExamples'] = new_codes
        done.append(entry)
    return done


def load_extras():
    """Merges every specs/_extras_*.py: each defines EXTRAS = {topic_id: {'beginner': [...], 'intermediate': [...], 'expert': [...]}}
    whose blocks are appended after the topic's own blocks (expert extras come before the practice questions)."""
    sys.path.insert(0, os.path.join(HERE, 'specs'))
    merged = {}
    specs_dir = os.path.join(HERE, 'specs')
    for fn in sorted(os.listdir(specs_dir)):
        if fn.startswith('_extras_') and fn.endswith('.py'):
            s = importlib.util.spec_from_file_location(fn[:-3], os.path.join(specs_dir, fn))
            m = importlib.util.module_from_spec(s)
            s.loader.exec_module(m)
            for tid, tiers in m.EXTRAS.items():
                for tier, blocks in tiers.items():
                    merged.setdefault(tid, {}).setdefault(tier, []).extend(blocks)
    return merged


def build(spec_name: str):
    spec_path = os.path.join(HERE, 'specs', spec_name + '.py')
    mod_spec = importlib.util.spec_from_file_location('spec_' + spec_name, spec_path)
    mod = importlib.util.module_from_spec(mod_spec)
    mod_spec.loader.exec_module(mod)
    t = mod.TOPIC
    topic = {'id': t['id'], 'name': t['name']}
    sys.path.insert(0, os.path.join(HERE, 'specs'))
    from _practice import PRACTICE
    ex = load_extras().get(t['id'], {})
    t = {**t, 'beginner': list(t.get('beginner', [])) + ex.get('beginner', []),
         'intermediate': list(t.get('intermediate', [])) + ex.get('intermediate', [])}
    new_expert = ex.get('expert', [])
    new_practice = [b for b in new_expert if 'class="practice"' in b[0]]     # extra practice questions join the practice section
    expert = list(t.get('expert', [])) + [b for b in new_expert if b not in new_practice]
    extra = list(PRACTICE.get(t['id'], [])) + new_practice
    if extra:
        expert.append((INTRO,))
        expert.extend(extra)                       # practice questions come last in the lesson
    t = {**t, 'expert': expert}
    for tier in ('beginner', 'intermediate', 'expert'):
        topic[tier] = process_blocks(t.get(tier, []), f"{t['id']}/{tier}")
    topic['interviewQA'] = [list(q) for q in t.get('qa', [])]
    samples = sum(len(b.get('codeExamples', [])) for tier in ('beginner', 'intermediate', 'expert') for b in topic[tier])
    var = re.sub(r'[^A-Za-z0-9]', '', t['name'])
    var = var[0].lower() + var[1:] + 'Topic'
    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, spec_name + '.ts')
    ts = ("// GENERATED by scripts/collection-lessons/build.py from specs/%s.py: do not edit by hand.\n"
          "// Every code sample below was compiled and run; the OUTPUT comments are the real program output.\n"
          "import type { Topic } from '../types';\n\n"
          "export const %s: Topic = %s;\n") % (spec_name, var, json.dumps(topic, ensure_ascii=False, indent=2))
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(ts)
    print(f'{spec_name}: {samples} samples verified -> {os.path.relpath(out)}')


if __name__ == '__main__':
    names = sys.argv[1:] or ['all']
    if names == ['all']:
        names = sorted(f[:-3] for f in os.listdir(os.path.join(HERE, 'specs')) if f.endswith('.py') and not f.startswith('_'))
    for n in names:
        build(n)
