"""Small helpers for writing lesson specs: HTML snippets and the method-card layout used for every method of a collection class."""

OUT = '// OUTPUT: @auto'


def ul(items):
    return '<ul>\n' + '\n'.join(f'<li>{i}</li>' for i in items) + '\n</ul>'


def table(headers, rows):
    head = ''.join(f'<th style="text-align:left;">{h}</th>' for h in headers)
    body = '\n'.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)
    return f'<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">\n<tr>{head}</tr>\n{body}\n</table>'


def method(title, sig, returns, time, fresher, expert, code, watch=None, extra_codes=()):
    """One method card: what it is, how it behaves, a plain-English explanation for freshers, the deeper picture for experienced
    developers, an optional "watch out", and a runnable sample (more than one via extra_codes)."""
    html = (f'<h3 class="mcard">{title}</h3>\n'
            f'<ul>\n<li><strong>Signature:</strong> <code>{sig}</code></li>\n<li><strong>Returns:</strong> {returns}</li>\n<li><strong>Time:</strong> {time}</li>\n</ul>\n'
            f'<p><strong>For freshers:</strong> {fresher}</p>\n'
            f'<p><strong>For experienced developers:</strong> {expert}</p>')
    if watch:
        html += f'\n<p><strong>Watch out:</strong> {watch}</p>'
    return (html, [code, *extra_codes])


def section(title, intro, items=None):
    html = f'<h3>{title}</h3>\n<p>{intro}</p>'
    if items:
        html += '\n' + ul(items)
    return (html, [])


def box(name, kind, green):
    bg, bd = ('#eef7e9', '#8fbf7f') if green else ('#e6eefc', '#7fa0d9')
    return (f'<div style="background:{bg}; border:1px solid {bd}; border-radius:5px; padding:3px 8px; text-align:center; line-height:1.25;">'
            f'<strong style="font-size:12px; padding:0 5px;">{name}</strong><br><span style="font-size:11px;">({kind})</span></div>')


def link(word, color, name, kind, green):
    return (f'<div style="display:inline-flex; align-items:center; gap:4px;"><span style="font-size:11px; color:{color}; white-space:nowrap;">&larr; {word}</span>'
            f'{box(name, kind, green)}</div>')


def hierarchy(chain):
    """chain = [(name, kind, green, word_before_it_or_None, color)] -> the small wrapping inheritance diagram."""
    parts = []
    for name, kind, green, word, color in chain:
        parts.append(link(word, color, name, kind, green) if word else box(name, kind, green))
    return ('<div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:8px 4px; width:100%; font-size:12px; line-height:1.25;">\n'
            + '\n'.join(parts) + '\n</div>')





def practice(title, intro, steps, code, level='Medium', hints=None):
    """A practice QUESTION: a problem statement, the tasks, optional hints, and one complete verified solution (with its real output)."""
    html = (f'<h3 class="practice">{title}</h3>\n<p><strong>Level:</strong> {level}</p>\n<p><strong>Problem:</strong> {intro}</p>\n'
            '<p><strong>Your task:</strong></p>\n<ol>\n' + '\n'.join(f'<li>{x}</li>' for x in steps) + '\n</ol>')
    if hints:
        html += '\n<p><strong>Hints:</strong></p>\n' + ul(hints)
    html += '\n<p><em>Try it on your own first. The program below is one complete solution, with the real output it prints.</em></p>'
    return (html, [code])
