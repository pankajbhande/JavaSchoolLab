import { Topic } from '../coreJava';

export const jsonFundamentals: Topic = {
    id: 'json-fundamentals',
    name: 'JSON - Structure & Parsing',
    beginner: [
        {
            content: `<h3>What is JSON?</h3>

<table>
<tr><th>Point</th><th>Detail</th></tr>
<tr><td>Stands for</td><td>JavaScript Object Notation</td></tr>
<tr><td>Used for</td><td>Storing and exchanging data</td></tr>
<tr><td>File extension</td><td>.json</td></tr>
<tr><td>Internet media type</td><td>application/json</td></tr>
</table>

<h3>Usage of JSON</h3>
<div class="border">
• <strong>Transfer data from the server</strong> - when you send a request to a server, the data comes back in JSON form.<br>
• <strong>Transfer data between the server and a web application</strong> using JSON.<br>
• <strong>Web services and APIs</strong> use the JSON format to deliver data.<br>
</div>`
        },
        {
            content: `<h3>JSON Data Types</h3>
There are six data types used in JSON.<br><br>

<table>
<tr><th>Type</th><th>Rule and example</th></tr>
<tr><td>String</td><td>Must be written in double quotes only. <code>{"name": "ajay"}</code> - name is the key, ajay is the value.</td></tr>
<tr><td>Number</td><td>Must be an integer or a floating-point number. <code>{"age": 30}</code></td></tr>
<tr><td>Object</td><td>A value can itself be an object. <code>{"employee": {"name": "ajay", "age": 30}}</code></td></tr>
<tr><td>Array</td><td>A value can be an array. <code>{"employee": ["ram", "ajay", "ashok"]}</code></td></tr>
<tr><td>Boolean</td><td>A value can be true or false. <code>{"sale": true}</code></td></tr>
<tr><td>Null</td><td>A value can be null. <code>{"middlename": null}</code></td></tr>
</table>

<h3>JSON Syntax Rules</h3>
<div class="border">
• Data should be in <strong>key and value</strong> pairs.<br>
• Data should be separated by <strong>commas</strong>.<br>
• <strong>Curly braces</strong> <code>{ }</code> hold objects.<br>
• <strong>Square brackets</strong> <code>[ ]</code> hold arrays.<br>
</div>`,
            codeExamples: [
                `{
  "student": [
    {
      "id": 10,
      "firstName": "ajay",
      "lastName": "patil"
    },
    {
      "id": 11,
      "firstName": "sohan",
      "lastName": "deshmukh"
    }
  ]
}

// Reading the four rules off this document:
//  - key/value pair  ->  "id" is the key, 10 is the value
//  - comma separated ->  between "id" and "firstName"
//  - curly braces    ->  each student is one object
//  - square brackets ->  "student" holds an array of those objects`
            ]
        },
        {
            content: `<h3>JSON Objects</h3>
A JSON object holds key and value pairs. Each key is a String; the value can be any of the six types.<br><br>

<div class="border">
• The key and the value are separated by a <strong>colon</strong>.<br>
• One key/value pair is separated from the next by a <strong>comma</strong>.<br>
• The curly brace <code>{</code> starts a JSON object.<br>
</div><br>

In the example below, <code>employee</code> is the object; <code>name</code> and <code>salary</code> are its keys, and <code>ajay</code> and <code>50000</code> are the matching values.<br>`,
            codeExamples: [
                `{
  "employee": {
    "name": "ajay",
    "salary": 50000
  }
}`,
                `// JSON object with strings
{
  "firstName": "ajay",
  "lastName": "patil"
}

// JSON object with numbers
{
  "integer": 34,
  "fraction": 0.2150,
  "exponent": 6.650e+2
}
// NOTE: the leading zero in 0.2150 is required. JSON rejects ".2150",
// even though JavaScript accepts it.

// JSON object with booleans
{
  "first": true,
  "second": false
}`,
                `// JSON nested object - an object as the value of a key
{
  "firstName": "ajay",
  "lastName": "patil",
  "age": 30,
  "address": {
    "streetNo": "M G Road",
    "city": "pune",
    "state": "maharashtra",
    "country": "india"
  }
}
// The comma after "age": 30 is required - it separates that pair
// from the "address" pair that follows.`
            ]
        },
        {
            content: `<h3>JSON Arrays</h3>
<div class="border">
• A JSON array represents an <strong>ordered list of values</strong>.<br>
• It can store multiple values: strings, numbers, booleans or objects.<br>
• Values must be separated by commas.<br>
• Square brackets <code>[ ]</code> represent a JSON array.<br>
</div>`,
            codeExamples: [
                `// Array of strings
["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Array of numbers
[10, 20, 30, 50]

// Array of booleans
[true, false, true, false]`,
                `// Array of objects - the shape almost every REST API returns
{
  "employees": [
    {"name": "ajay",   "email": "ajay@gmail.com"},
    {"name": "sandip", "email": "sandip@gmail.com"},
    {"name": "vikas",  "email": "vikas@gmail.com"},
    {"name": "suresh", "email": "suresh@gmail.com"}
  ]
}
// {"name": "ajay", "email": "ajay@gmail.com"} is the first object.`,
                `// Reading the braces of a nested document

{                                    <-- outer object starts
  "firstName": "ajay",
  "lastName": "patil",
  "age": 30,
  "address": {                       <-- inner object starts
    "streetNo": "M G Road",              <-- value is a string
    "city": "pune",
    "state": "maharashtra",
    "country": "india"
  }                                  <-- inner object ends
}                                    <-- outer object ends`
            ]
        },
        {
            content: `<h3>How to Read Data from a JSON File</h3>

<div class="border">
1. Create the Maven project<br>
2. Add the json dependency to pom.xml<br>
3. Create the JSON file<br>
4. Create the test class<br>
5. Run the application and check the output<br>
</div><br>

<strong>Step 1</strong> - <code>File => New => Other =></code> type <em>Maven Project</em> <code>=></code> Next <code>=></code> tick <em>Create a simple project</em>, enter the Group Id and Artifact Id, then Finish.<br><br>
<strong>Step 3</strong> - create a <code>jsonfiles</code> folder, right-click it, <code>New -> File</code>, name it <code>sample.json</code>, then Finish.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>com.googlecode.json-simple</groupId>
    <artifactId>json-simple</artifactId>
    <version>1.1.1</version>
</dependency>`,
                `// Step 4 - jsonfiles/sample.json
{
  "firstName": "ajay",
  "lastName": "patil",
  "address": [
    {
      "city": "pune",
      "state": "maharashtra",
      "country": "india"
    },
    {
      "city": "mumbai",
      "state": "maharashtra",
      "country": "india"
    }
  ]
}`,
                `// Step 5 - JSONTest.java
package com.velocity;

import java.io.FileReader;
import java.io.IOException;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class JSONTest {

    public static void main(String[] args) throws IOException, ParseException {

        JSONParser jsonParser = new JSONParser();
        FileReader fileReader = new FileReader(".\\\\jsonfiles\\\\sample.json");

        Object obj = jsonParser.parse(fileReader);
        JSONObject jsonObject = (JSONObject) obj;

        String fname = (String) jsonObject.get("firstName");
        String lname = (String) jsonObject.get("lastName");

        System.out.println("First Name>>" + fname);
        System.out.println("Last Name>>" + lname);

        JSONArray jsonArray = (JSONArray) jsonObject.get("address");

        for (int i = 0; i < jsonArray.size(); i++) {

            JSONObject address = (JSONObject) jsonArray.get(i);

            String city    = (String) address.get("city");
            String state   = (String) address.get("state");
            String country = (String) address.get("country");

            System.out.println("City>>" + city);
            System.out.println("State>>" + state);
            System.out.println("Country>>" + country);
        }
    }
}`,
                `// Run as -> Java Application
// OUTPUT:
First Name>>ajay
Last Name>>patil
City>>pune
State>>maharashtra
Country>>india
City>>mumbai
State>>maharashtra
Country>>india`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Five Things That Are Not Valid JSON</h3>
JSON looks like a JavaScript object literal and is stricter than one. Every item below is legal JavaScript and rejected by a JSON parser - and each is a real cause of "Unexpected token" at 2am.<br><br>

<table>
<tr><th>Not allowed</th><th>Why, and the fix</th></tr>
<tr><td><code>{'name': 'ajay'}</code></td><td>Single quotes. Strings and keys must use double quotes: <code>{"name": "ajay"}</code>.</td></tr>
<tr><td><code>{name: "ajay"}</code></td><td>Unquoted key. Every key must be a quoted String.</td></tr>
<tr><td><code>[1, 2, 3,]</code></td><td>Trailing comma before the closing bracket or brace. Remove it.</td></tr>
<tr><td><code>{"x": .5}</code> or <code>{"x": 05}</code></td><td>A number needs a leading digit and no leading zero: <code>0.5</code>, <code>5</code>.</td></tr>
<tr><td><code>// a comment</code></td><td>JSON has no comments at all. Use a <code>"_comment"</code> key, or a format that supports them (YAML, JSON5).</td></tr>
</table>
<br>
Also worth knowing: <code>NaN</code>, <code>Infinity</code> and <code>undefined</code> are not JSON values, and the smart/curly quotes that a word processor substitutes for <code>"</code> break every parser. If a JSON file was copied out of a PDF or a Word document, that is the first thing to check.<br>`,
            codeExamples: [
                `// What the parser tells you, and what it means

// json-simple:
Unexpected character (') at position 1.
// -> single-quoted key or value

// Jackson:
com.fasterxml.jackson.core.JsonParseException:
  Unexpected character ('}' (code 125)): was expecting double-quote
  to start field name
// -> trailing comma, or an unquoted key

// Jackson:
Unrecognized field "firtName" (class com.velocity.Student),
  not marked as ignorable
// -> the JSON key does not match any field on the target class`
            ]
        },
        {
            content: `<h3>json-simple vs Jackson - Use Jackson</h3>
<code>json-simple 1.1.1</code> is the library the example uses, and it is worth knowing why you will not use it in a Spring Boot project. It was last released in 2012, has no generics (<code>JSONObject</code> is a raw <code>Map</code>, hence every cast in that example), and cannot bind JSON to your own classes.<br><br>

Jackson is what <code>spring-boot-starter-web</code> already puts on the classpath, so in a Spring Boot application you add no dependency at all.<br><br>

<table>
<tr><th>Aspect</th><th>json-simple</th><th>Jackson</th></tr>
<tr><td>Reading a field</td><td><code>(String) obj.get("city")</code> - unchecked cast</td><td>Bound to a typed field, checked by the compiler</td></tr>
<tr><td>Nested arrays</td><td>Manual loop with a cast per element</td><td><code>List&lt;Address&gt;</code> filled automatically</td></tr>
<tr><td>Writing JSON</td><td>Build a Map by hand</td><td><code>writeValueAsString(object)</code></td></tr>
<tr><td>In Spring Boot</td><td>Extra dependency</td><td>Already present via spring-boot-starter-web</td></tr>
<tr><td>Maintained</td><td>No - last release 2012</td><td>Yes</td></tr>
</table>`,
            codeExamples: [
                `// The same sample.json, read with Jackson - no casts anywhere
public class Student {
    private String firstName;
    private String lastName;
    private List<Address> address;
    // getters and setters
}

public class Address {
    private String city;
    private String state;
    private String country;
    // getters and setters
}

ObjectMapper mapper = new ObjectMapper();
Student s = mapper.readValue(new File("jsonfiles/sample.json"), Student.class);

System.out.println(s.getFirstName());
s.getAddress().forEach(a -> System.out.println(a.getCity()));
// OUTPUT:
// ajay
// pune
// mumbai`,
                `// Writing an object back out as JSON
ObjectMapper mapper = new ObjectMapper();

String json = mapper.writeValueAsString(s);
// {"firstName":"ajay","lastName":"patil","address":[{"city":"pune",...}]}

String pretty = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(s);
// OUTPUT:
// {
//   "firstName" : "ajay",
//   "lastName" : "patil",
//   "address" : [ {
//     "city" : "pune",
//     "state" : "maharashtra",
//     "country" : "india"
//   } ]
// }`
            ]
        },
        {
            content: `<h3>JSON in a Spring Boot REST Controller</h3>
In a Spring Boot application you almost never touch a parser. Jackson sits behind <code>@RequestBody</code> and the return value of a <code>@RestController</code> method, converting in both directions through an <code>HttpMessageConverter</code>.<br><br>

<table>
<tr><th>Annotation</th><th>Direction</th></tr>
<tr><td>@RequestBody</td><td>Incoming JSON -> Java object (deserialisation)</td></tr>
<tr><td>Return value of a @RestController method</td><td>Java object -> outgoing JSON (serialisation)</td></tr>
</table>
<br>
The annotations most worth knowing on the model class:<br><br>

<table>
<tr><th>Annotation</th><th>Effect</th></tr>
<tr><td>@JsonProperty("first_name")</td><td>Maps a Java field to a differently-named JSON key.</td></tr>
<tr><td>@JsonIgnore</td><td>Keeps a field out of the JSON entirely - the standard guard for password hashes.</td></tr>
<tr><td>@JsonInclude(NON_NULL)</td><td>Omits null fields instead of emitting <code>"x": null</code>.</td></tr>
<tr><td>@JsonFormat(pattern = "dd-MM-yyyy")</td><td>Controls date and time rendering.</td></tr>
<tr><td>@JsonIgnoreProperties(ignoreUnknown = true)</td><td>Accepts JSON containing keys the class does not have, instead of failing.</td></tr>
</table>`,
            codeExamples: [
                `@RestController
@RequestMapping("/api/students")
public class StudentController {

    // Java object -> JSON, automatically
    @GetMapping("/{id}")
    public Student get(@PathVariable int id) {
        return service.findById(id);
    }

    // JSON -> Java object, automatically
    @PostMapping
    public Student create(@RequestBody Student student) {
        return service.save(student);
    }
}
// OUTPUT:
// GET  /api/students/10
//   -> {"id":10,"firstName":"ajay","city":"pune"}
//
// POST /api/students   with body {"firstName":"sohan","city":"mumbai"}
//   -> {"id":11,"firstName":"sohan","city":"mumbai"}
//
// No JSONParser, no casts, no manual loop.`,
                `@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class Student {

    private Integer id;

    @JsonProperty("first_name")           // JSON key differs from the field name
    private String firstName;

    @JsonIgnore                           // never serialised, never accepted
    private String passwordHash;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate enrolledOn;

    private String middleName;            // null -> omitted, not "middleName": null
}
// OUTPUT:
// {"id":10,"first_name":"ajay","enrolledOn":"14-07-2023"}
// passwordHash is absent, middleName is absent because it was null,
// and an incoming payload carrying an extra "nickname" key is accepted
// rather than rejected.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does JSON stand for, and what is its media type?</td><td>JavaScript Object Notation; <code>application/json</code>.</td></tr>
<tr><td>What are the six JSON data types?</td><td>String, Number, Object, Array, Boolean, Null.</td></tr>
<tr><td>What are the four syntax rules?</td><td>Data in key/value pairs; pairs separated by commas; curly braces hold objects; square brackets hold arrays.</td></tr>
<tr><td>Can JSON keys use single quotes?</td><td>No. Keys and string values must use double quotes - single quotes are a parse error.</td></tr>
<tr><td>Is a trailing comma allowed?</td><td>No. <code>[1, 2, 3,]</code> is valid JavaScript and invalid JSON.</td></tr>
<tr><td>Can JSON contain comments?</td><td>No. Use a <code>"_comment"</code> key or a different format.</td></tr>
<tr><td>Difference between a JSON object and a JSON array?</td><td>An object is an unordered set of key/value pairs in <code>{ }</code>; an array is an ordered list of values in <code>[ ]</code>.</td></tr>
<tr><td>JSON vs XML?</td><td>JSON is lighter, has no closing tags, maps directly to language data structures, and parses faster. XML supports attributes, namespaces, comments and schema validation.</td></tr>
<tr><td>Which JSON library does Spring Boot use by default?</td><td>Jackson, pulled in transitively by spring-boot-starter-web.</td></tr>
<tr><td>Which annotation converts an incoming JSON body into a Java object?</td><td><code>@RequestBody</code>. The return value of a @RestController method goes the other way automatically.</td></tr>
<tr><td>How do you keep a field out of the JSON response?</td><td><code>@JsonIgnore</code> on the field, or leave it off the DTO entirely.</td></tr>
<tr><td>Incoming JSON has a key your class does not declare - what happens?</td><td>Jackson throws <code>UnrecognizedPropertyException</code> by default. <code>@JsonIgnoreProperties(ignoreUnknown = true)</code> makes it tolerant.</td></tr>
</table>`
        }
    ]
};
