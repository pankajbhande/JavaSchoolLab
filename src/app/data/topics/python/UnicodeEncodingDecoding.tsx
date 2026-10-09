import type { Topic } from '../../types';

export const unicodeEncodingDecoding: Topic = {
    id: 'python-basics-unicode-encoding-decoding',
    name: 'Unicode, Encoding & Decoding',
    beginner: [
        {
            content: `<h4>Text vs Bytes</h4>
Computers store and send <b>bytes</b> (numbers 0-255). Humans read <b>text</b> (characters). Python 3 keeps the two strictly separate:<br><br>
• <code>str</code> - a sequence of <b>Unicode characters</b>. This is what you work with in your program.<br>
• <code>bytes</code> - a sequence of raw bytes, written <code>b"..."</code>. This is what goes into files and across networks.<br><br>
<b>Encoding</b> turns text into bytes; <b>decoding</b> turns bytes back into text. The rules for doing so are called an encoding - almost always <b>UTF-8</b>.`
        },
        {
            content: `<h4>Unicode Code Points</h4>
Unicode gives every character in every language a unique number called a <b>code point</b>. <code>ord()</code> gives the code point of a character; <code>chr()</code> gives the character for a code point.`,
            codeExamples: [
                `print(ord("A"), ord("a"), ord("₹"), ord("अ"))
print(chr(65), chr(8377), chr(2309))
print(hex(ord("₹")))

# OUTPUT:
# 65 97 8377 2309
# A ₹ अ
# 0x20b9`
            ]
        },
        {
            content: `<h4>encode() and decode()</h4>`,
            codeExamples: [
                `text = "Price: ₹500"

data = text.encode("utf-8")         # str -> bytes
print(data)
print(type(data), len(text), len(data))

back = data.decode("utf-8")         # bytes -> str
print(back, back == text)

# OUTPUT:
# b'Price: \\xe2\\x82\\xb9500'
# <class 'bytes'> 11 13
# Price: ₹500 True`
            ]
        },
        {
            content: `<h4>Always Specify the Encoding for Files</h4>
When opening text files, pass <code>encoding="utf-8"</code>. Otherwise Python uses the operating system's default, which on Windows has historically not been UTF-8 - a file that reads fine on Linux can then crash or show garbled text on Windows.`,
            codeExamples: [
                `with open("greeting.txt", "w", encoding="utf-8") as f:
    f.write("नमस्ते, Python!")

with open("greeting.txt", encoding="utf-8") as f:
    print(f.read())

# OUTPUT:
# नमस्ते, Python!`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>How UTF-8 Works</h3>
UTF-8 is a <b>variable-length</b> encoding: ASCII characters take 1 byte (so plain English files are identical in ASCII and UTF-8), while other characters take 2 to 4 bytes. That is why <code>len(text)</code> (characters) and <code>len(text.encode())</code> (bytes) can differ.`,
            codeExamples: [
                `for ch in ["A", "é", "₹", "😀"]:
    encoded = ch.encode("utf-8")
    print(ch, f"U+{ord(ch):04X}", len(encoded), "bytes", encoded)

# OUTPUT:
# A U+0041 1 bytes b'A'
# é U+00E9 2 bytes b'\\xc3\\xa9'
# ₹ U+20B9 3 bytes b'\\xe2\\x82\\xb9'
# 😀 U+1F600 4 bytes b'\\xf0\\x9f\\x98\\x80'`
            ]
        },
        {
            content: `<h3>Decode Errors and Error Handlers</h3>
Decoding bytes with the wrong encoding raises <code>UnicodeDecodeError</code> - or worse, silently produces garbage ("mojibake"). The <code>errors</code> argument controls what happens with bad bytes.`,
            codeExamples: [
                `data = "café".encode("utf-8")

print(data.decode("latin-1"))                    # wrong encoding: mojibake
print(b"caf\\xe9".decode("utf-8", errors="replace"))
print(b"caf\\xe9".decode("utf-8", errors="ignore"))
print("₹ price".encode("ascii", errors="replace"))
print(b"caf\\xe9".decode("utf-8"))

# OUTPUT:
# cafÃ©
# caf�
# caf
# b'? price'
# UnicodeDecodeError: 'utf-8' codec can't decode byte 0xe9 in position 3: unexpected end of data`
            ]
        },
        {
            content: `<h3>One Visible Character, Several Code Points</h3>
"é" can be stored as one code point (U+00E9) or as "e" followed by a combining accent (U+0301). They look identical but compare unequal. Normalise text with <code>unicodedata.normalize()</code> before comparing or storing user input.`,
            codeExamples: [
                `import unicodedata

a = "caf\\u00e9"          # precomposed é
b = "cafe\\u0301"         # e + combining acute accent

print(a, b, a == b, len(a), len(b))

na = unicodedata.normalize("NFC", a)
nb = unicodedata.normalize("NFC", b)
print(na == nb, len(nb))
print(unicodedata.name("₹"))

# OUTPUT:
# café café False 4 5
# True 4
# RUPEE SIGN`
            ]
        },
        {
            content: `<h3>The "Unicode Sandwich"</h3>
The rule professional Python code follows:<br>
1. <b>Decode</b> bytes to <code>str</code> as early as possible (when reading files, network data, database results).<br>
2. Work only with <code>str</code> inside your program.<br>
3. <b>Encode</b> to bytes as late as possible (when writing or sending).<br><br>
Mixing <code>str</code> and <code>bytes</code> is a <code>TypeError</code> in Python 3, which forces you to be explicit.`,
            codeExamples: [
                `print(b"abc" == "abc")
print(b"abc" + "def")

# OUTPUT:
# False
# TypeError: can't concat str to bytes`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>str vs bytes?</td><td>str holds Unicode text; bytes holds raw 8-bit values. Convert with encode() and decode()</td></tr>
<tr class='text-center'><td>What is UTF-8?</td><td>A variable-length (1-4 byte) Unicode encoding, backward-compatible with ASCII - the default for the web and Python source files</td></tr>
<tr class='text-center'><td>Why can <code>len(s) != len(s.encode())</code>?</td><td>len counts code points; non-ASCII characters need several bytes in UTF-8</td></tr>
<tr class='text-center'><td>What causes UnicodeDecodeError?</td><td>Decoding bytes with an encoding that doesn't match how they were written</td></tr>
<tr class='text-center'><td>Why always pass encoding to open()?</td><td>The default depends on the operating system, so files may be read differently on Windows and Linux</td></tr>
<tr class='text-center'><td>What is Unicode normalisation?</td><td>Converting equivalent sequences (e.g. é vs e + accent) to one canonical form so they compare equal</td></tr>
</table>`
        }
    ]
};
