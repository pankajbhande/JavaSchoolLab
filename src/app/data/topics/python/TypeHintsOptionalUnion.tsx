import type { Topic } from '../../types';

export const typeHintsOptionalUnion: Topic = {
    id: 'python-type-hints-optional-union',
    name: 'Optional & Union',
    beginner: [
        {
            content: `<h4>A Value of One Type or Another: Union</h4>
When a value may be one of several types, list them with <code>|</code> (Python 3.10+). Older code writes <code>Union[int, str]</code> from <code>typing</code> - they mean the same thing.`,
            codeExamples: [
                `def to_text(value: int | float | str) -> str:
    return str(value)

print(to_text(5), to_text(2.5), to_text("hi"))

# Older equivalent:
# from typing import Union
# def to_text(value: Union[int, float, str]) -> str: ...

# OUTPUT:
# 5 2.5 hi`
            ]
        },
        {
            content: `<h4>Maybe None: Optional</h4>
A very common case is "a value, or <code>None</code>". Write <code>str | None</code>, or the older <code>Optional[str]</code> - which is just shorthand for <code>Union[str, None]</code>. It is Python's version of Java's nullable reference or <code>Optional&lt;String&gt;</code>.`,
            codeExamples: [
                `from typing import Optional

def find_email(user_id: int) -> str | None:
    emails = {1: "asha@mail.com", 2: "ravi@mail.com"}
    return emails.get(user_id)

def find_phone(user_id: int) -> Optional[str]:    # same meaning, older style
    return None

print(find_email(1), find_email(99), find_phone(1))

# OUTPUT:
# asha@mail.com None None`
            ]
        },
        {
            content: `<h4>Narrowing: Check Before You Use</h4>
With <code>str | None</code>, the checker won't let you call string methods until you have ruled out <code>None</code>. An <code>if value is None</code> check (or <code>isinstance</code>) <b>narrows</b> the type inside each branch.`,
            codeExamples: [
                `def shout(name: str | None) -> str:
    return name.upper()                    # might be None!

def shout_safe(name: str | None) -> str:
    if name is None:
        return "ANONYMOUS"
    return name.upper()                    # here name is known to be str

print(shout_safe("asha"), shout_safe(None))

# mypy reports for shout() (wording may vary by version):
# error: Item "None" of "str | None" has no attribute "upper"  [union-attr]
#
# OUTPUT:
# ASHA ANONYMOUS`,
                `def describe(value: int | str) -> str:
    if isinstance(value, int):
        return f"number {value + 1}"       # value is int here
    return f"text {value.upper()}"         # value is str here

print(describe(41), describe("ok"))

# OUTPUT:
# number 42 text OK`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>"Optional" Does Not Mean "Optional Argument"</h3>
<code>Optional[X]</code> only means the value <b>may be None</b>. Whether the caller can <b>omit</b> the argument depends on having a default value. The two ideas are independent.`,
            codeExamples: [
                `def a(note: str | None):            # may be None, but must be passed
    return note

def b(note: str = "none"):           # may be omitted, but never None
    return note

def c(note: str | None = None):      # may be omitted AND may be None
    return note

print(a(None), b(), c())
a()

# OUTPUT:
# None none None
# TypeError: a() missing 1 required positional argument: 'note'`
            ]
        },
        {
            content: `<h3>The Two Spellings Are Equivalent</h3>
<code>Optional[int]</code>, <code>Union[int, None]</code> and <code>int | None</code> all describe the same type, and the checker treats them identically. Prefer <code>X | None</code> in code that targets Python 3.10 or newer; it reads more naturally and needs no import.`,
            codeExamples: [
                `from typing import Optional, Union

print(Optional[int])
print(Union[int, None])
print(int | None)
print(type(int | None))

# OUTPUT:
# typing.Optional[int]
# typing.Optional[int]
# int | None
# <class 'types.UnionType'>`
            ]
        },
        {
            content: `<h3>Return None or Raise?</h3>
A <code>-&gt; X | None</code> return type forces every caller to handle <code>None</code>. That is right when "not found" is a normal outcome (searching, <code>dict.get</code>). When the absence means something went wrong, <b>raise an exception</b> and keep the return type plain - the checker then doesn't make every caller add <code>None</code> checks.`,
            codeExamples: [
                `def find_user(user_id: int) -> str | None:     # "not found" is normal
    return {1: "Asha"}.get(user_id)

def load_user(user_id: int) -> str:             # absence is an error
    users = {1: "Asha"}
    if user_id not in users:
        raise KeyError(f"no user {user_id}")
    return users[user_id]

print(find_user(5))
print(load_user(1))
load_user(5)

# OUTPUT:
# None
# Asha
# KeyError: 'no user 5'`
            ]
        },
        {
            content: `<h3>Other Narrowing Tools</h3>
• <b>Early return / guard clause</b> - after <code>if x is None: return</code>, the rest of the function sees <code>X</code>.<br>
• <b>assert</b> - <code>assert x is not None</code> narrows for the checker (but is removed with <code>python -O</code>, so don't rely on it for real validation).<br>
• <b>Truthiness</b> - <code>if name:</code> also narrows, but treats <code>""</code> like <code>None</code>.<br>
• <b>Custom type guards</b> - <code>typing.TypeGuard</code> / <code>TypeIs</code> (3.13) let your own boolean functions narrow types.`,
            codeExamples: [
                `def first_word(text: str | None) -> str:
    if not text:
        return ""
    return text.split()[0]                 # text is str here

print(repr(first_word(None)), repr(first_word("")), first_word("hello world"))

# OUTPUT:
# '' '' hello`
            ]
        },
        {
            content: `<h3>Unions Are Checked by Tools, Not by Python</h3>
At runtime nothing stops a wrong type; a union only helps the checker. If you must validate input from outside (JSON, forms), check with <code>isinstance</code> - which accepts <code>X | Y</code> unions directly since 3.10 - or use a validation library such as Pydantic.`,
            codeExamples: [
                `def parse_qty(raw: object) -> int:
    if isinstance(raw, int | str):
        return int(raw)
    raise TypeError(f"unsupported type: {type(raw).__name__}")

print(parse_qty(3), parse_qty("7"))
parse_qty(2.5)

# OUTPUT:
# 3 7
# TypeError: unsupported type: float`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>Optional[str]</code> mean?</td><td>str or None - exactly the same as <code>Union[str, None]</code> and <code>str | None</code></td></tr>
<tr class='text-center'><td>Does Optional make an argument optional to pass?</td><td>No - only a default value does; Optional only allows None as a value</td></tr>
<tr class='text-center'><td>What is type narrowing?</td><td>The checker refining a union inside a branch after an <code>is None</code> or <code>isinstance</code> check</td></tr>
<tr class='text-center'><td>Union vs <code>|</code>?</td><td>Same meaning; the <code>|</code> syntax needs Python 3.10+ (or <code>from __future__ import annotations</code> inside annotations)</td></tr>
<tr class='text-center'><td>When should a function return None instead of raising?</td><td>When absence is a normal, expected result; raise when it indicates an error</td></tr>
</table>`
        }
    ]
};
