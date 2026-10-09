import { Topic } from '../coreJava';

export const patternMatchingForSwitch: Topic = {
                        id: 'switch-pattern',
                        name: 'Pattern Matching for Switch',
                        beginner: [
                            {
                                content: `<h3>Pattern Matching for Switch in Java 21</h3>
<h4>Introduction</h4>
<p><strong>Pattern Matching for Switch</strong> (JEP 441, final in Java 21) lets a switch test patterns, not just constants. You can match types, take records apart, add guards, and handle null, all inside one switch.</p>

<h4>Key Features</h4>
<ul>
<li><strong>Type patterns</strong> — match and cast in one step: <code>case String s</code></li>
<li><strong>Record patterns</strong> — take a record apart: <code>case Point(var x, var y)</code></li>
<li><strong>Guarded patterns</strong> — add a condition: <code>case String s when s.length() &gt; 5</code></li>
<li><strong>Null handling</strong> — an explicit null case: <code>case null</code></li>
<li><strong>Exhaustiveness</strong> — with sealed types the compiler checks that every subtype is covered</li>
</ul>

<h4>Before vs After</h4>
<ul>
<li><b>Before:</b> long if-else instanceof chains</li>
<li><b>After:</b> one clean switch with type patterns</li>
</ul>`,
                                codeExamples: [
`// Pattern Matching for Switch — Basic Usage
public class SwitchPatternBasic {
    // OLD: if-else instanceof chain
    static String describeOld(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof Integer i) return "Integer: " + i;
        if (obj instanceof String s) return "String: " + s;
        if (obj instanceof Double d) return "Double: " + d;
        return "Unknown: " + obj;
    }

    // NEW: Pattern matching switch (Java 21)
    static String describeNew(Object obj) {
        return switch (obj) {
            case null          -> "null";
            case Integer i     -> "Integer: " + i;
            case String s      -> "String: " + s;
            case Double d      -> "Double: " + d;
            case int[] arr     -> "int array of length " + arr.length;
            default            -> "Unknown: " + obj;
        };
    }

    public static void main(String[] args) {
        System.out.println(describeNew(42));          // Integer: 42
        System.out.println(describeNew("Hello"));     // String: Hello
        System.out.println(describeNew(3.14));        // Double: 3.14
        System.out.println(describeNew(null));         // null
        System.out.println(describeNew(new int[]{1,2})); // int array of length 2
        System.out.println(describeNew(true));         // Unknown: true
    }
}

// OUTPUT:
// Integer: 42
// String: Hello
// Double: 3.14
// null
// int array of length 2
// Unknown: true`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>Pattern Matching for Switch — Intermediate Usage</h3>
<h4>Guarded Patterns</h4>
<p>The <strong>when</strong> keyword adds a condition (guard) to a pattern. The case matches only if both the pattern and the guard are true.</p>

<h4>Dominance and Order</h4>
<p>More specific patterns must come before general ones. The compiler enforces <strong>dominance rules</strong>: a dominated case can never run, so it is a compile error.</p>

<h4>Null Handling</h4>
<p>A switch used to throw <code>NullPointerException</code> for a null selector. Now you can handle null explicitly with <strong>case null</strong>.</p>

<h4>Best Practices</h4>
<ul>
<li>Order cases from most specific to most general</li>
<li>Use <strong>when</strong> guards instead of nested if statements</li>
<li>Always handle null explicitly if the input can be null</li>
<li>Use sealed types to get exhaustiveness checks</li>
</ul>`,
                                codeExamples: [
`// Pattern Matching for Switch — Intermediate Usage
sealed interface Animal permits Dog, Cat, Fish {}
record Dog(String name, String breed) implements Animal {}
record Cat(String name, boolean indoor) implements Animal {}
record Fish(String species, int count) implements Animal {}

public class SwitchPatternIntermediate {
    // Guarded patterns with 'when'
    static String classifyNumber(Object obj) {
        return switch (obj) {
            case Integer i when i < 0  -> "Negative integer: " + i;
            case Integer i when i == 0 -> "Zero";
            case Integer i when i > 0  -> "Positive integer: " + i;
            case Double d when d.isNaN()     -> "NaN";
            case Double d when d.isInfinite() -> "Infinite";
            case Double d              -> "Double: " + d;
            case String s when s.isBlank()   -> "Blank string";
            case String s              -> "String: " + s;
            case null                  -> "null value";
            default                    -> "Other: " + obj;
        };
    }

    // Exhaustive switch with sealed types + record patterns
    static String describeAnimal(Animal animal) {
        return switch (animal) {
            case Dog(var name, var breed) when breed.equals("Labrador")
                -> name + " is a friendly Labrador!";
            case Dog(var name, var breed)
                -> name + " is a " + breed;
            case Cat(var name, var indoor) when indoor
                -> name + " is an indoor cat";
            case Cat(var name, var indoor)
                -> name + " is an outdoor cat";
            case Fish(var species, var count) when count > 10
                -> "A school of " + count + " " + species;
            case Fish(var species, var count)
                -> count + " " + species;
            // No default needed — all sealed subtypes covered!
        };
    }

    public static void main(String[] args) {
        System.out.println(classifyNumber(-5));
        System.out.println(classifyNumber(0));
        System.out.println(classifyNumber(42));
        System.out.println(classifyNumber(Double.NaN));
        System.out.println(classifyNumber(null));

        System.out.println(describeAnimal(new Dog("Rex", "Labrador")));
        System.out.println(describeAnimal(new Cat("Whiskers", true)));
        System.out.println(describeAnimal(new Fish("Goldfish", 15)));
    }
}

// OUTPUT:
// Negative integer: -5
// Zero
// Positive integer: 42
// NaN
// null value
// Rex is a friendly Labrador!
// Whiskers is an indoor cat
// A school of 15 Goldfish`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Pattern Matching for Switch — Expert Deep Dive</h3>
<h4>Dominance Rules</h4>
<ul>
<li>A pattern p <strong>dominates</strong> pattern q if every value matching q also matches p</li>
<li><code>case Object o</code> dominates all type patterns</li>
<li><code>case String s</code> dominates <code>case String s when ...</code></li>
<li>The dominating (general) case must come <b>after</b> the dominated (specific) one. If the general case is first, the specific case below it is unreachable and the compiler reports an error</li>
</ul>

<h4>Completeness Analysis</h4>
<ul>
<li>For sealed types, the compiler knows all permitted subtypes</li>
<li>For enums, all constants are known</li>
<li>The compiler adds a hidden default that throws <strong>MatchException</strong> (not <code>IllegalStateException</code>) if an unexpected value appears at run time</li>
</ul>

<h4>Performance</h4>
<ul>
<li>A pattern switch is compiled to an <code>invokedynamic</code> type switch, which picks the matching case at run time</li>
<li>The JVM can optimize it, and it is usually as fast as an instanceof chain</li>
</ul>`,
                                codeExamples: [
`// Expert Pattern Matching for Switch
sealed interface JsonValue permits JsonString, JsonNumber, JsonBool,
    JsonNull, JsonArray, JsonObject {}
record JsonString(String value) implements JsonValue {}
record JsonNumber(double value) implements JsonValue {}
record JsonBool(boolean value) implements JsonValue {}
record JsonNull() implements JsonValue {}
record JsonArray(java.util.List<JsonValue> elements)
    implements JsonValue {}
record JsonObject(java.util.Map<String, JsonValue> fields)
    implements JsonValue {}

public class SwitchPatternExpert {
    // Recursive JSON pretty-printer using pattern matching
    static String prettyPrint(JsonValue json, int indent) {
        String pad = " ".repeat(indent);
        return switch (json) {
            case JsonNull()     -> "null";
            case JsonBool(var b)  -> String.valueOf(b);
            case JsonNumber(var n) -> {
                yield n == Math.floor(n) ? String.valueOf((long) n) : String.valueOf(n);
            }
            case JsonString(var s) -> "\\"" + s + "\\"";
            case JsonArray(var elems) when elems.isEmpty() -> "[]";
            case JsonArray(var elems) -> {
                var sb = new StringBuilder("[\\n");
                for (int i = 0; i < elems.size(); i++) {
                    sb.append(pad).append("  ")
                      .append(prettyPrint(elems.get(i), indent + 2));
                    if (i < elems.size() - 1) sb.append(",");
                    sb.append("\\n");
                }
                sb.append(pad).append("]");
                yield sb.toString();
            }
            case JsonObject(var fields) when fields.isEmpty() -> "{}";
            case JsonObject(var fields) -> {
                var sb = new StringBuilder("{\\n");
                var entries = new java.util.ArrayList<>(fields.entrySet());
                for (int i = 0; i < entries.size(); i++) {
                    var entry = entries.get(i);
                    sb.append(pad).append("  \\"").append(entry.getKey()).append("\\": ")
                      .append(prettyPrint(entry.getValue(), indent + 2));
                    if (i < entries.size() - 1) sb.append(",");
                    sb.append("\\n");
                }
                sb.append(pad).append("}");
                yield sb.toString();
            }
        };
    }

    public static void main(String[] args) {
        // Build a JSON structure
        // LinkedHashMap keeps the insertion order (Map.of does not)
        var fields = new java.util.LinkedHashMap<String, JsonValue>();
        fields.put("name", new JsonString("Java"));
        fields.put("version", new JsonNumber(21));
        fields.put("features", new JsonArray(java.util.List.of(
            new JsonString("Virtual Threads"),
            new JsonString("Record Patterns"),
            new JsonString("Pattern Matching Switch")
        )));
        fields.put("lts", new JsonBool(true));

        System.out.println(prettyPrint(new JsonObject(fields), 0));
    }
}

// OUTPUT:
// {
//   "name": "Java",
//   "version": 21,
//   "features": [
//     "Virtual Threads",
//     "Record Patterns",
//     "Pattern Matching Switch"
//   ],
//   "lts": true
// }`
                                ]
                            }
                        ]
};
