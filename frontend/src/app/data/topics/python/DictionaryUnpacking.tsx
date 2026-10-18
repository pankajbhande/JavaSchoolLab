import type { Topic } from '../../types';

export const dictionaryUnpacking: Topic = {
    id: 'python-collections-dictionary-unpacking',
    name: 'Dictionary Unpacking',
    beginner: [
        {
            content: `<h4>** Inside a Dictionary Literal</h4>
Writing <code>**d</code> inside <code>{ }</code> copies all of <code>d</code>'s key-value pairs into the new dictionary. You can unpack several dicts and add extra keys in the same literal. When a key appears more than once, <b>the later value wins</b>.`,
            codeExamples: [
                `defaults = {"theme": "light", "font": 14}
user = {"theme": "dark"}

settings = {**defaults, **user}
print(settings)
print({**user, **defaults})                      # order matters
print({**defaults, "font": 16, "lang": "en"})    # mix with normal keys

# OUTPUT:
# {'theme': 'dark', 'font': 14}
# {'theme': 'light', 'font': 14}
# {'theme': 'light', 'font': 16, 'lang': 'en'}`
            ]
        },
        {
            content: `<h4>Three Ways to Merge</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Form</th><th>Result</th><th>Python version</th></tr>
<tr class='text-center'><td><code>{**a, **b}</code></td><td>New dict; can merge many dicts and add keys</td><td>3.5+</td></tr>
<tr class='text-center'><td><code>a | b</code></td><td>New dict</td><td>3.9+</td></tr>
<tr class='text-center'><td><code>a.update(b)</code> / <code>a |= b</code></td><td>Changes <code>a</code> in place</td><td>all / 3.9+</td></tr>
</table>
In all three, values from the right-hand side replace values from the left.`,
            codeExamples: [
                `a = {"x": 1, "y": 2}
b = {"y": 20, "z": 30}

print({**a, **b})
print(a | b)
a.update(b)
print(a)

# OUTPUT:
# {'x': 1, 'y': 20, 'z': 30}
# {'x': 1, 'y': 20, 'z': 30}
# {'x': 1, 'y': 20, 'z': 30}`
            ]
        },
        {
            content: `<h4>Passing a Dictionary as Keyword Arguments</h4>
In a function <b>call</b>, <code>**d</code> turns each key into a keyword argument name and each value into its argument. The keys must match the function's parameter names.`,
            codeExamples: [
                `def register(name, age, city="Pune"):
    print(f"{name}, {age}, {city}")

data = {"name": "Abaji", "age": 21}
register(**data)                         # same as register(name="Abaji", age=21)
register(**data, city="Mumbai")
register(**{"name": "Raoji", "age": 25, "city": "Latur"})

# OUTPUT:
# Abaji, 21, Pune
# Abaji, 21, Mumbai
# Raoji, 25, Latur`,
                `def register(name, age, city="Pune"):
    print(f"{name}, {age}, {city}")

register(**{"name": "Abaji", "age": 21, "email": "a@x.com"})

# OUTPUT:
# TypeError: register() got an unexpected keyword argument 'email'`
            ]
        },
        {
            content: `<h4>Collecting Keyword Arguments with **kwargs</h4>
In a function <b>definition</b>, <code>**kwargs</code> does the opposite: it collects any extra keyword arguments into a dictionary.`,
            codeExamples: [
                `def show(**info):
    for key, value in info.items():
        print(key, "=", value)

show(lang="Python", level="beginner")

# OUTPUT:
# lang = Python
# level = beginner`
            ]
        },
        {
            content: `<h4>Unpacking Keys and Pairs</h4>
Iterating over a dict - which is what <code>*</code> and plain unpacking do - gives its <b>keys</b>. Use <code>.items()</code> to unpack key-value pairs.`,
            codeExamples: [
                `point = {"x": 3, "y": 4}

print([*point])                  # keys only
a, b = point                     # also keys
print(a, b)

for key, value in point.items():
    print(key, value)

(only_key, only_value), = {"id": 7}.items()
print(only_key, only_value)

# OUTPUT:
# ['x', 'y']
# x y
# x 3
# y 4
# id 7`
            ]
        },
        {
            content: `<h4>Filling String Templates</h4>
<code>str.format(**d)</code> fills <code>{name}</code> placeholders from a dictionary; <code>format_map(d)</code> does the same without unpacking.`,
            codeExamples: [
                `user = {"name": "Sheru", "city": "Pune"}

print("{name} lives in {city}".format(**user))
print("{name} lives in {city}".format_map(user))

# OUTPUT:
# Sheru lives in Pune
# Sheru lives in Pune`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Layered Configuration</h3>
Merging with <code>**</code> is the standard way to build a configuration from defaults, then a config file, then environment overrides - each later layer wins.`,
            codeExamples: [
                `DEFAULTS = {"host": "localhost", "port": 8080, "debug": False}
file_config = {"port": 9000}
env_config = {"debug": True}

config = {**DEFAULTS, **file_config, **env_config}
print(config)

# OUTPUT:
# {'host': 'localhost', 'port': 9000, 'debug': True}`
            ]
        },
        {
            content: `<h3>Merging Is Shallow</h3>
<code>{**a, **b}</code>, <code>|</code> and <code>update()</code> replace a nested dict as a whole - they do not merge inside it, so keys from the nested default disappear. The nested dicts that are kept are also <b>shared</b>, not copied. A small recursive helper does a deep merge.`,
            codeExamples: [
                `defaults = {"db": {"host": "localhost", "port": 3306}, "debug": False}
override = {"db": {"port": 5432}}

print({**defaults, **override})          # "host" is lost!

def deep_merge(base, extra):
    result = dict(base)
    for key, value in extra.items():
        if isinstance(result.get(key), dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result

print(deep_merge(defaults, override))

# OUTPUT:
# {'db': {'port': 5432}, 'debug': False}
# {'db': {'host': 'localhost', 'port': 5432}, 'debug': False}`
            ]
        },
        {
            content: `<h3>Errors When Unpacking into Calls</h3>
• A keyword given both through <code>**d</code> and explicitly is an error - unlike dict literals, function calls don't let the later value win.<br>
• Keys that don't match a parameter raise "unexpected keyword argument" (unless the function accepts <code>**kwargs</code>).<br>
• Keys used with <code>**</code> in a call must be <b>strings</b>; <code>f(**{1: "a"})</code> raises <code>TypeError</code>.`,
            codeExamples: [
                `def connect(host, port):
    return f"{host}:{port}"

opts = {"host": "db.local", "port": 5432}
print(connect(**opts))
connect(**opts, port=3306)

# OUTPUT:
# db.local:5432
# TypeError: connect() got multiple values for keyword argument 'port'`
            ]
        },
        {
            content: `<h3>ChainMap: Layers Without Copying</h3>
<code>collections.ChainMap</code> searches several dicts in order <b>without</b> merging them into a new one. Changes to the underlying dicts show through immediately, and writes go to the first mapping only.`,
            codeExamples: [
                `from collections import ChainMap

defaults = {"theme": "light", "font": 14, "lang": "en"}
user = {"theme": "dark"}
session = {"font": 18}

settings = ChainMap(session, user, defaults)    # searched left to right
print(settings["theme"], settings["font"], settings["lang"])

user["theme"] = "blue"           # no copy was made - the change shows through
print(settings["theme"])

settings["lang"] = "hi"          # writes go to the first mapping
print(session)
print(dict(settings))

# OUTPUT:
# dark 18 en
# blue
# {'font': 18, 'lang': 'hi'}
# {'theme': 'blue', 'font': 18, 'lang': 'hi'}`
            ]
        },
        {
            content: `<h3>**rest in match/case</h3>
In a mapping pattern, <code>**rest</code> captures every key that wasn't named in the pattern into a new dict.`,
            codeExamples: [
                `def handle(event):
    match event:
        case {"type": "login", "user": user, **rest}:
            print(f"{user} logged in; extra fields: {sorted(rest)}")
        case {"type": kind}:
            print("Unhandled:", kind)

handle({"type": "login", "user": "abaji", "ip": "10.0.0.5", "device": "mobile"})
handle({"type": "logout"})

# OUTPUT:
# abaji logged in; extra fields: ['device', 'ip']
# Unhandled: logout`
            ]
        },
        {
            content: `<h3>Default Values for Missing Template Keys</h3>
<code>format_map()</code> looks keys up on the mapping you pass, so a dict subclass with <code>__missing__</code> can supply defaults instead of raising <code>KeyError</code>.`,
            codeExamples: [
                `class WithDefault(dict):
    def __missing__(self, key):
        return "?"

template = "{name} from {city}"
print(template.format_map(WithDefault(name="Abaji")))

# OUTPUT:
# Abaji from ?`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does <code>{**a, **b}</code> do?</td><td>Creates a new dict with a's pairs then b's; for duplicate keys b's value wins</td></tr>
<tr class='text-center'><td><code>{**a, **b}</code> vs <code>a | b</code> vs <code>a.update(b)</code>?</td><td>The first two build a new dict (| needs 3.9+); update modifies a in place</td></tr>
<tr class='text-center'><td>What does <code>f(**d)</code> do?</td><td>Passes each key-value pair as a keyword argument; keys must be strings matching parameter names</td></tr>
<tr class='text-center'><td>What does <code>[*d]</code> give for a dict?</td><td>A list of its keys</td></tr>
<tr class='text-center'><td>Is dict merging deep?</td><td>No - nested dicts are replaced (and shared), not merged; write a recursive merge if needed</td></tr>
<tr class='text-center'><td>What is ChainMap for?</td><td>Looking up keys across several dicts in priority order without copying them</td></tr>
</table>`
        }
    ]
};
