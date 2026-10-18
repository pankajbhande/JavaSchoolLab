import type { Topic } from '../../types';

export const textVsBinaryFiles: Topic = {
    id: 'python-file-handling-text-vs-binary-files',
    name: 'Text vs Binary Files',
    beginner: [
        {
            content: `<h4>Two Ways to Open a File</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>Text mode (<code>"r"</code>, <code>"w"</code>)</th><th>Binary mode (<code>"rb"</code>, <code>"wb"</code>)</th></tr>
<tr class='text-center'><td>Reads/writes</td><td><code>str</code></td><td><code>bytes</code></td></tr>
<tr class='text-center'><td>Encoding</td><td>Decodes/encodes with <code>encoding=</code></td><td>None - raw bytes</td></tr>
<tr class='text-center'><td>Line endings</td><td>Translated (<code>\\r\\n</code> ↔ <code>\\n</code>)</td><td>Untouched</td></tr>
<tr class='text-center'><td>Use for</td><td>.txt, .csv, .json, .py, .html</td><td>Images, PDFs, zip, audio, any non-text data</td></tr>
</table>
In Java terms: text mode is like a <code>Reader</code>/<code>Writer</code>, binary mode like an <code>InputStream</code>/<code>OutputStream</code>.`
        },
        {
            content: `<h4>Same File, Two Views</h4>
Reading the same file in text mode gives characters; in binary mode it gives the bytes actually stored on disk. "é" takes two bytes in UTF-8.`,
            codeExamples: [
                `with open("cafe.txt", "w", encoding="utf-8", newline="\\n") as f:
    f.write("café\\n")

with open("cafe.txt", encoding="utf-8") as f:
    text = f.read()
with open("cafe.txt", "rb") as f:
    raw = f.read()

print(repr(text), type(text).__name__, len(text))
print(raw, type(raw).__name__, len(raw))
print(raw.decode("utf-8") == text)

# OUTPUT:
# 'café\\n' str 5
# b'caf\\xc3\\xa9\\n' bytes 6
# True`
            ]
        },
        {
            content: `<h4>Writing Bytes</h4>
In binary mode you must write <code>bytes</code>, not <code>str</code> - encode text first.`,
            codeExamples: [
                `with open("data.bin", "wb") as f:
    f.write(b"\\x00\\x01\\x02")
    f.write("OK".encode("utf-8"))

with open("data.bin", "rb") as f:
    print(f.read())

with open("data.bin", "wb") as f:
    f.write("text")

# OUTPUT:
# b'\\x00\\x01\\x02OK'
# TypeError: a bytes-like object is required, not 'str'`
            ]
        },
        {
            content: `<h4>Newline Translation</h4>
Text mode converts line endings for you; binary mode shows what is really in the file. Here the file is written with Windows line endings on purpose.`,
            codeExamples: [
                `with open("lines.txt", "w", encoding="utf-8", newline="\\r\\n") as f:
    f.write("line1\\nline2\\n")

with open("lines.txt", "rb") as f:
    print(f.read())                          # what is on disk

with open("lines.txt", encoding="utf-8") as f:
    print(repr(f.read()))                    # translated back to \\n

# OUTPUT:
# b'line1\\r\\nline2\\r\\n'
# 'line1\\nline2\\n'`
            ]
        },
        {
            content: `<h4>Copying Any File in Chunks</h4>
Binary mode can copy anything - an image, a PDF, a zip - byte for byte. Reading fixed-size chunks keeps memory use small even for huge files.`,
            codeExamples: [
                `with open("photo.bin", "wb") as f:          # stand-in for an image
    f.write(bytes(range(256)) * 4)           # 1024 bytes

with open("photo.bin", "rb") as src, open("photo_copy.bin", "wb") as dst:
    while chunk := src.read(100):            # 100 bytes at a time
        dst.write(chunk)

with open("photo.bin", "rb") as a, open("photo_copy.bin", "rb") as b:
    original, copy = a.read(), b.read()
print(len(original), len(copy), original == copy)

# OUTPUT:
# 1024 1024 True`
            ]
        },
        {
            content: `<h4>Reading a File Signature</h4>
Many binary formats start with fixed "magic bytes" that identify the type, whatever the file extension says. A PNG image always starts with <code>b"\\x89PNG\\r\\n\\x1a\\n"</code>; a PDF starts with <code>b"%PDF"</code>; a zip with <code>b"PK"</code>.`,
            codeExamples: [
                `PNG_SIGNATURE = b"\\x89PNG\\r\\n\\x1a\\n"

with open("fake.png", "wb") as f:
    f.write(PNG_SIGNATURE + b"...image data...")

def file_type(path):
    with open(path, "rb") as f:
        head = f.read(8)
    if head == PNG_SIGNATURE:
        return "PNG image"
    if head.startswith(b"%PDF"):
        return "PDF document"
    if head.startswith(b"PK"):
        return "ZIP archive"
    return "unknown"

print(file_type("fake.png"))

# OUTPUT:
# PNG image`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Why Binary Mode for Non-Text Files</h3>
Opening an image in text mode makes Python try to <b>decode</b> its bytes as text, which usually fails - and even when it doesn't, newline translation corrupts the data on write. Rule: if the file isn't human-readable text, use <code>"rb"</code> / <code>"wb"</code>. (See <i>Unicode, Encoding &amp; Decoding</i> for the str/bytes relationship.)`,
            codeExamples: [
                `with open("image.bin", "wb") as f:
    f.write(b"\\x89PNG\\r\\n\\x1a\\n\\xff\\xd8")

with open("image.bin", encoding="utf-8") as f:
    f.read()

# OUTPUT:
# UnicodeDecodeError: 'utf-8' codec can't decode byte 0x89 in position 0: invalid start byte`
            ]
        },
        {
            content: `<h3>bytearray: Mutable Bytes</h3>
<code>bytes</code> is immutable like <code>str</code>. <code>bytearray</code> is its mutable twin - useful when building or patching binary data in place. Indexing either one gives integers 0-255.`,
            codeExamples: [
                `data = b"hello"
print(data[0], data[:2])

buf = bytearray(b"hello")
buf[0] = ord("H")             # change one byte
buf.extend(b"!")
print(buf, bytes(buf))

# OUTPUT:
# 104 b'he'
# bytearray(b'Hello!') b'Hello!'`
            ]
        },
        {
            content: `<h3>struct: Reading and Writing Binary Records</h3>
Binary formats store numbers as fixed-size byte groups. <code>struct.pack</code> turns Python values into bytes according to a format string and <code>struct.unpack</code> reverses it. Here <code>&lt;</code> means little-endian, <code>H</code> a 2-byte unsigned int and <code>I</code> a 4-byte unsigned int.`,
            codeExamples: [
                `import struct

FORMAT = "<HHI"                         # item id, quantity, price in paise
record = struct.pack(FORMAT, 7, 3, 1500)
print(record, struct.calcsize(FORMAT))

with open("orders.bin", "wb") as f:
    f.write(record)

with open("orders.bin", "rb") as f:
    item_id, qty, price = struct.unpack(FORMAT, f.read(struct.calcsize(FORMAT)))
print(item_id, qty, price)

# OUTPUT:
# b'\\x07\\x00\\x03\\x00\\xdc\\x05\\x00\\x00' 8
# 7 3 1500`
            ]
        },
        {
            content: `<h3>base64: Bytes Inside Text</h3>
JSON, e-mail and HTML can only carry text. <b>Base64</b> encodes arbitrary bytes using 64 safe ASCII characters (about 33% larger), so binary data such as a small image can travel inside a text format.`,
            codeExamples: [
                `import base64

raw = b"Hi!"
encoded = base64.b64encode(raw)
print(encoded, encoded.decode("ascii"))
print(base64.b64decode(encoded) == raw)
print(base64.b64encode(b"Python"))

# OUTPUT:
# b'SGkh' SGkh
# True
# b'UHl0aG9u'`
            ]
        },
        {
            content: `<h3>Copying and Measuring Files</h3>
For real copies use <code>shutil</code>, which handles buffering for you (<code>copy2</code> also preserves timestamps). File sizes on disk are in <b>bytes</b>, which for text depends on the encoding.`,
            codeExamples: [
                `import os
import shutil
from pathlib import Path

with open("hello.txt", "w", encoding="utf-8") as f:
    f.write("नमस्ते")                      # 6 characters

shutil.copyfile("hello.txt", "hello_copy.txt")

print(len("नमस्ते"))
print(os.path.getsize("hello.txt"))
print(Path("hello_copy.txt").stat().st_size)

# OUTPUT:
# 6
# 18
# 18`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Text mode vs binary mode?</td><td>Text mode reads/writes str, applying an encoding and newline translation; binary mode reads/writes raw bytes unchanged</td></tr>
<tr class='text-center'><td>Which mode for images or PDFs?</td><td>Binary - "rb" / "wb"</td></tr>
<tr class='text-center'><td>What does f.read() return in "rb" mode?</td><td>A bytes object</td></tr>
<tr class='text-center'><td>bytes vs bytearray?</td><td>bytes is immutable; bytearray is mutable</td></tr>
<tr class='text-center'><td>How do you parse fixed-layout binary records?</td><td>With the struct module (pack / unpack with a format string)</td></tr>
<tr class='text-center'><td>Why can len(text) differ from the file size?</td><td>The file stores encoded bytes; in UTF-8 non-ASCII characters take 2-4 bytes</td></tr>
</table>`
        }
    ]
};
