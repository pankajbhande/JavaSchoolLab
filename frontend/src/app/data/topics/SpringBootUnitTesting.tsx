import { Topic } from '../coreJava';

export const springBootUnitTesting: Topic = {
    id: 'spring-boot-unit-testing',
    name: 'Unit Testing with JUnit 5 & Mockito',
    beginner: [
        {
            content: `<h3>Business Requirement</h3>
The team ships a Spring Boot service every fortnight. Before each release somebody opens the application, hits the endpoints by hand and reads the console to check the numbers are right. That is slow, it is not repeatable, and nobody re-checks the old features. <br><br>

<strong>Problem Statement</strong>: replace the manual "run it and look at the console" check with automated tests that run on every build and fail loudly the moment a method stops behaving. <br><br>

<strong>Unit testing</strong> is the level of testing where an individual <strong>unit</strong> of code - a method, a class, a module - is exercised in isolation to confirm it does exactly what it claims. It is written by developers during the coding phase, not by a QA team afterwards. <br><br>

<strong>JUnit</strong> is the free, open-source unit testing framework for Java, originally written by <strong>Kent Beck</strong> and <strong>Erich Gamma</strong> and first released in 1997. It is lightweight: a test is an ordinary Java method with an annotation on it. <br><br>

<div class="border">
The manual approach the PDF starts with:<br>
<code>System.out.println("Addition is&gt;&gt;" + result);</code> - a human reads the number and decides.<br>
The automated approach:<br>
<code>assertEquals(30, result);</code> - the machine decides, every single build, forever.
</div>`
        },

        {
            content: `<h3>Steps - the first test</h3>
<table>
<tr><th>Step</th><th>What you do</th></tr>
<tr><td>1</td><td><code>File -&gt; New -&gt; Spring Starter Project</code>, name it, finish</td></tr>
<tr><td>2</td><td>Confirm <code>spring-boot-starter-test</code> is in <code>pom.xml</code> - it is added by default and brings JUnit 5, Mockito, AssertJ and Hamcrest with it</td></tr>
<tr><td>3</td><td>Write the production class <code>Example</code> under <code>src/main/java</code></td></tr>
<tr><td>4</td><td>Write <code>ExampleTest</code> under <code>src/test/java</code>, in the <strong>same package</strong></td></tr>
<tr><td>5</td><td>Right-click the test class, <code>Run As -&gt; JUnit Test</code></td></tr>
<tr><td>6</td><td>Read the JUnit view: green means passed, red means failed</td></tr>
</table>
<br>
Two rules that trip people up on day one: the test class lives under <code>src/test/java</code> (never <code>src/main/java</code>, or it ships to production), and it mirrors the production package so it can see package-private members. <br><br>

<code>@Test</code> marks a method as a test case. <code>assertEquals(expected, actual)</code> compares the two - and the order matters, expected first, because that is what the failure message prints.`,
            codeExamples: [`// src/main/java/com/velocity/sample/Example.java
package com.velocity.sample;

public class Example {

    public int getAddition(int a, int b) {
        return a + b;
    }

    public int getMultiplication(int a, int b) {
        return a * b;
    }
}


// src/test/java/com/velocity/sample/ExampleTest.java
package com.velocity.sample;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

public class ExampleTest {

    @Test
    public void getAdditionTest() {
        Example example = new Example();
        int actualResult = example.getAddition(10, 20);
        int expectedResult = 30;
        assertEquals(expectedResult, actualResult);
    }

    @Test
    public void getMultiplicationTest() {
        Example example = new Example();
        int actualResult = example.getMultiplication(3, 4);
        int expectedResult = 12;
        assertEquals(expectedResult, actualResult);
    }
}

// OUTPUT (JUnit view):
// ExampleTest
//   |- getAdditionTest()        PASSED   (green)
//   |- getMultiplicationTest()  PASSED   (green)
// Tests run: 2, Failures: 0, Errors: 0, Skipped: 0

// NOTE ON THE SOURCE PDF: its main() method reads
//     TestExample testExample = new TestExample();
// but the class it created is called Example, and it lives in a
// different package (com.velocity.test vs com.velocity.sample).
// That is a copy-paste slip - the file does not compile as printed.
// Also, calling business logic BEFORE SpringApplication.run(...) is
// not how you demonstrate anything about Spring; it is plain Java
// running before the container even exists.`]
        },

        {
            content: `<h3>What a failing test looks like</h3>
Deliberately break one assertion so you learn to read the failure. Expect 20 from <code>3 * 4</code>: <br><br>

The bar turns red and JUnit prints a <code>ComparisonFailure</code>-style message naming both values. This is why <code>assertEquals(expected, actual)</code> argument order matters - swap them and every failure message you ever read will be back to front, which costs real debugging time.`,
            codeExamples: [`@Test
public void getMultiplicationTest() {
    Example example = new Example();
    int actualResult = example.getMultiplication(3, 4);
    int expectedResult = 20;                 // deliberately wrong
    assertEquals(expectedResult, actualResult);
}

// OUTPUT:
// org.opentest4j.AssertionFailedError: expected: <20> but was: <12>
//     at ExampleTest.getMultiplicationTest(ExampleTest.java:21)
// Tests run: 2, Failures: 1
//
// JUnit view:
//   |- getAdditionTest()        PASSED  (green)
//   |- getMultiplicationTest()  FAILED  (red)`]
        },

        {
            content: `<h3>Lifecycle annotations - stop creating the object in every test</h3>
In the version above we wrote <code>new Example()</code> inside both test methods. That is duplication, and in a real test class the setup is far heavier than one constructor call. JUnit 5 gives four hooks: <br><br>

<table>
<tr><th>Annotation</th><th>Behaviour</th></tr>
<tr><td>@BeforeAll</td><td>Runs once, before any test in the class. Must be <code>static</code> (unless the class is <code>@TestInstance(PER_CLASS)</code>). Use for genuinely expensive one-time setup.</td></tr>
<tr><td>@AfterAll</td><td>Runs once, after every test in the class has finished. Also <code>static</code>. Use to release what <code>@BeforeAll</code> acquired.</td></tr>
<tr><td>@BeforeEach</td><td>Runs before <strong>every</strong> test method. Non-static. This is where fresh, per-test state belongs.</td></tr>
<tr><td>@AfterEach</td><td>Runs after every test method. Non-static. Cleanup that must happen even between tests.</td></tr>
</table>
<br>
A detail the console output makes obvious: <strong>test execution order is not source order</strong>. JUnit 5 uses a deterministic but deliberately non-obvious algorithm, so a test that only passes because an earlier test left state behind will fail unpredictably. That is precisely why <code>@BeforeEach</code> exists.`,
            codeExamples: [`package com.velocity.sample;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ExampleTest {

    public static Example example = null;

    @BeforeAll
    public static void init() {
        System.out.println("inside init() method");
        example = new Example();
    }

    @AfterAll
    public static void destroy() {
        System.out.println("inside destroy() method");
        example = null;
    }

    @BeforeEach
    public void demo1() {
        System.out.println("use of before each>>");
    }

    @AfterEach
    public void demo2() {
        System.out.println("use of after each>>");
    }

    @Test
    public void getAdditionTest() {
        System.out.println("inside getAdditionTest() method");
        assertEquals(30, example.getAddition(10, 20));
    }

    @Test
    public void getMultiplicationTest() {
        System.out.println("inside getMultiplicationTest() method");
        // The PDF re-creates "Example example = new Example();" here,
        // shadowing the shared field and defeating the whole point of
        // @BeforeAll. Deleted on purpose - use the shared instance.
        assertEquals(12, example.getMultiplication(3, 4));
    }
}

// OUTPUT (console):
// inside init() method
// use of before each>>
// inside getMultiplicationTest() method
// use of after each>>
// use of before each>>
// inside getAdditionTest() method
// use of after each>>
// inside destroy() method
//
// Note the order: getMultiplicationTest ran BEFORE getAdditionTest,
// even though getAdditionTest is written first. Never rely on order.`]
        },

        {
            content: `<h3>The JUnit 5 assertion family</h3>
An assertion validates the expected output against the actual output. All of them are <code>static</code> methods on <code>org.junit.jupiter.api.Assertions</code>, so they are normally brought in with a static import. <br><br>

<table>
<tr><th>Assertion</th><th>Checks</th></tr>
<tr><td>assertEquals / assertNotEquals</td><td>Value equality via <code>equals()</code>. For objects this means your entity must implement <code>equals()</code> sensibly, or the comparison falls back to reference identity.</td></tr>
<tr><td>assertTrue / assertFalse</td><td>A boolean condition.</td></tr>
<tr><td>assertNull / assertNotNull</td><td>Reference is or is not <code>null</code>.</td></tr>
<tr><td>assertSame / assertNotSame</td><td>Reference identity (<code>==</code>), not <code>equals()</code>. Useful when a cache or a singleton is supposed to hand back the very same instance.</td></tr>
<tr><td>assertThrows</td><td>The supplied lambda throws the expected exception type; returns the exception so you can assert on its message.</td></tr>
<tr><td>assertAll</td><td>Groups several assertions so that all of them are evaluated and every failure is reported, instead of stopping at the first.</td></tr>
</table>
<br>
JUnit 5's assertions live in the <strong>Jupiter API</strong>. The dependencies you need are <code>org.junit.jupiter</code> (the programming model) and <code>org.junit.platform</code> (the launcher that actually runs it) - both arrive transitively with <code>spring-boot-starter-test</code>, so in a Boot project you add nothing.`,
            codeExamples: [`import static org.junit.jupiter.api.Assertions.*;

@Test
void assertionTour() {
    assertEquals(30, example.getAddition(10, 20));
    assertNotEquals(31, example.getAddition(10, 20));

    assertTrue(example.getAddition(10, 20) > 0);
    assertFalse(example.getAddition(-10, 5) > 0);

    String cached = null;
    assertNull(cached);
    assertNotNull(example);

    Example a = example;
    assertSame(example, a);          // same reference
    assertNotSame(example, new Example());

    // assertAll reports EVERY failure, not just the first
    assertAll("addition",
        () -> assertEquals(30, example.getAddition(10, 20)),
        () -> assertEquals(0,  example.getAddition(-5, 5)),
        () -> assertEquals(5,  example.getAddition(5, 0)));
}

// OUTPUT: all assertions pass, test is green.
//
// If two of the assertAll lambdas had failed, the report would be:
// org.opentest4j.MultipleFailuresError: addition (2 failures)
//     expected: <30> but was: <29>
//     expected: <0> but was: <1>
// A plain sequence of assertEquals would only ever have shown the first.`]
        },

        {
            content: `<h3>@ParameterizedTest - one method, many inputs</h3>
<strong>Problem Statement</strong>: <code>isPalindrome(String)</code> needs checking against "madam", "katak", "nitin", "level" and a handful of non-palindromes. Writing five near-identical <code>@Test</code> methods is noise. <br><br>

A <strong>@ParameterizedTest</strong> runs the same method once per input, and each run is reported as a separate test with its own pass/fail. Note it replaces <code>@Test</code> - you do not put both on the method. Four source annotations feed it: <br><br>

<table>
<tr><th>Source annotation</th><th>Where the values come from</th></tr>
<tr><td>@ValueSource</td><td>A literal array in the annotation itself - <code>strings</code>, <code>ints</code>, <code>longs</code>, <code>doubles</code>, <code>booleans</code>. One argument per run only.</td></tr>
<tr><td>@CsvSource</td><td>Inline comma-separated rows, so a run can take several arguments - typically input plus expected result.</td></tr>
<tr><td>@CsvFileSource</td><td>The same, but the rows live in a <code>.csv</code> file on the test classpath. <code>numLinesToSkip = 1</code> skips the header row.</td></tr>
<tr><td>@MethodSource</td><td>A static method that returns a <code>Stream</code> of arguments - the only option when the inputs are objects rather than literals.</td></tr>
</table>
<br>
Two more annotations worth knowing at this point: <strong>@RepeatedTest(5)</strong> runs the same method a fixed number of times, and <strong>@Disabled</strong> skips a test class or method without deleting it (always give it a reason string).`,
            codeExamples: [`// src/main/java/com/velocity/sample/ExampleParameterized.java
package com.velocity.sample;

public class ExampleParameterized {

    public boolean isPalindrome(String str) {
        String reverse = "";
        int length = str.length();
        for (int i = length - 1; i >= 0; i--) {
            reverse = reverse + str.charAt(i);
        }
        return str.equals(reverse);     // the PDF's if/else returning
                                        // true/false is the same thing
    }
}


// src/test/java/com/velocity/sample/ExampleParameterizedTest.java
package com.velocity.sample;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

public class ExampleParameterizedTest {

    private final ExampleParameterized subject = new ExampleParameterized();

    @ParameterizedTest
    @ValueSource(strings = { "madam", "katak", "jeevan" })
    public void isPalindromeTest(String str) {
        assertTrue(subject.isPalindrome(str));
    }
}

// OUTPUT:
// isPalindromeTest(String)
//   |- [1] madam    PASSED
//   |- [2] katak    PASSED
//   |- [3] jeevan   FAILED  <-- expected: <true> but was: <false>
// Tests run: 3, Failures: 1
//
// Each input is its OWN reported test - that is the value. A single
// @Test with a loop would have told you only that "something failed".
//
// NOTE ON THE SOURCE PDF: it writes the third value with curly
// typographic quotes -  "jeevan"  copied out of Word. Java only
// accepts straight ASCII double quotes; the curly form is a
// compile error: "illegal character: '\\u201d'". Retype them.`]
        },

        {
            content: `<h3>@CsvFileSource - inputs and expected results in a file</h3>
<strong>Problem Statement</strong>: <code>getEvenOddNumber(int)</code> returns "even" or "odd". The test data is a table of input plus expected output, and the analyst who owns the cases would rather edit a spreadsheet than Java source. <br><br>

Put the file under <code>src/test/resources</code> so it lands on the <strong>test classpath</strong>, and reference it with a leading slash. Each non-skipped row becomes one run, and each column becomes one method parameter in order.`,
            codeExamples: [`// src/main/java/com/velocity/sample/ExampleParameterizedCsvFile.java
package com.velocity.sample;

public class ExampleParameterizedCsvFile {

    public String getEvenOddNumber(int number) {
        return (number % 2 == 0) ? "even" : "odd";
    }
}


// src/test/resources/test.csv
// input,expected
// 10,even
// 7,odd
// 0,even
// -3,odd


// src/test/java/com/velocity/sample/ExampleParameterizedCsvFileTest.java
package com.velocity.sample;

import static org.junit.jupiter.api.Assertions.assertEquals;   // the PDF
                              // omits this semicolon - it will not compile

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;

public class ExampleParameterizedCsvFileTest {

    private final ExampleParameterizedCsvFile subject =
            new ExampleParameterizedCsvFile();

    @ParameterizedTest
    @CsvFileSource(resources = "/test.csv", numLinesToSkip = 1)
    void getEvenOddNumberTest(int input, String expected) {
        // JUnit converts "10" to int for us - no Integer.parseInt needed.
        assertEquals(expected, subject.getEvenOddNumber(input));
        //           ^^^^^^^^ expected FIRST.
        // The PDF writes assertEquals(actual, expected) - reversed.
        // It still passes, but every failure message it ever prints
        // will name the wrong value as "expected".
    }
}

// OUTPUT:
// getEvenOddNumberTest(int, String)
//   |- [1] 10, even   PASSED
//   |- [2] 7, odd     PASSED
//   |- [3] 0, even    PASSED
//   |- [4] -3, odd    PASSED
// Tests run: 4, Failures: 0`]
        },

        {
            content: `<h3>Testing that an exception is thrown</h3>
<strong>Problem Statement</strong>: <code>convertToInt(String)</code> must reject <code>null</code> and blank input with an <code>IllegalArgumentException</code>. The failure path is behaviour too, and it needs a test just as much as the happy path. <br><br>

<strong>assertThrows</strong> takes the expected exception class and a lambda. It fails if nothing is thrown, fails if the wrong type is thrown, and <strong>returns the caught exception</strong> so you can assert on the message - which is the part most people forget, and it is what stops a test passing for the wrong reason.`,
            codeExamples: [`// src/main/java/com/velocity/sample/ExampleStringException.java
package com.velocity.sample;

public class ExampleStringException {

    public static Integer convertToInt(String str) {
        if (str == null || str.trim().length() == 0) {
            throw new IllegalArgumentException("String must be not null or empty");
        }
        return Integer.valueOf(str);
    }
}


// src/test/java/com/velocity/sample/ExampleStringExceptionTest.java
package com.velocity.sample;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

public class ExampleStringExceptionTest {

    @Test
    public void convertToIntNullParameterAssertThrows() {
        String s = null;
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> ExampleStringException.convertToInt(s));

        // Assert the MESSAGE too. Without this the test would also pass
        // if the method threw IllegalArgumentException for some entirely
        // unrelated reason.
        assertEquals("String must be not null or empty", ex.getMessage());
    }

    @Test
    public void convertToIntBlankParameterAssertThrows() {
        assertThrows(IllegalArgumentException.class,
                () -> ExampleStringException.convertToInt("   "));
    }

    @Test
    public void convertToIntNonNumericThrowsNumberFormat() {
        // Integer.valueOf throws NumberFormatException, which IS a
        // subclass of IllegalArgumentException. assertThrows matches
        // subclasses, so asking for IllegalArgumentException here would
        // pass and tell you nothing. Be specific.
        assertThrows(NumberFormatException.class,
                () -> ExampleStringException.convertToInt("abc"));
    }
}

// OUTPUT:
// Tests run: 3, Failures: 0, Errors: 0
//
// If convertToInt silently returned null instead of throwing:
// org.opentest4j.AssertionFailedError: Expected
//   java.lang.IllegalArgumentException to be thrown, but nothing was thrown.`]
        },

        {
            content: `<h3>Mocking - why the service cannot be tested alone</h3>
<strong>Problem Statement</strong>: <code>UserService.getEmailByUserId(id)</code> delegates to <code>UserDao.findEmailById(id)</code>, which hits a database. Test it as it stands and you are testing MySQL, the network, the schema and the data all at once - and the test fails on a laptop with no database running. <br><br>

<strong>Mocking</strong> replaces that external dependency with a dummy object you control completely. The purpose is to <strong>isolate</strong> the code under test so a failure can only mean one thing: the code under test is wrong. <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">WITHOUT MOCKING                    WITH MOCKING

  UserServiceTest                    UserServiceTest
        |                                  |
        v                                  v
   UserService                        UserService
        |                                  |
        v                                  v
    UserDaoImpl                     UserDao (mock)
        |                                  |
        v                                  |
     MySQL  <-- must be running       returns whatever
        |                              you told it to
        v
   real rows  <-- must exist

  slow, fragile, needs a DBA        fast, deterministic, offline</pre>`
        },

        {
            content: `<h3>Steps - mocking a DAO with Mockito</h3>
The source material reaches for <strong>PowerMock</strong> here. That advice is now out of date and you should not follow it - see the expert section. The modern equivalent, which ships inside <code>spring-boot-starter-test</code> with no extra dependency at all, is <strong>Mockito</strong>. <br><br>

<table>
<tr><th>Step</th><th>What you do</th></tr>
<tr><td>1</td><td>Create the Spring Boot starter project</td></tr>
<tr><td>2</td><td>Confirm <code>spring-boot-starter-test</code> (test scope) is present - it already contains Mockito, so add nothing</td></tr>
<tr><td>3</td><td>Create the <code>UserDao</code> interface and its <code>UserDaoImpl</code></td></tr>
<tr><td>4</td><td>Create <code>UserService</code>, taking <code>UserDao</code> through its constructor</td></tr>
<tr><td>5</td><td>Create <code>UserServiceTest</code> under <code>src/test/java</code> with <code>@ExtendWith(MockitoExtension.class)</code></td></tr>
<tr><td>6</td><td>Run as JUnit test and read the result</td></tr>
</table>
<br>
Notice that <code>UserService</code> takes its dependency through a <strong>constructor</strong>. That single design choice is what makes it testable - a field-injected <code>@Autowired</code> private field with no constructor cannot be given a mock without reflection.`,
            codeExamples: [`// UserDao.java
package com.velocity.dao;

public interface UserDao {
    String findNameById(Integer id);
    String findEmailById(Integer id);
}


// UserDaoImpl.java
package com.velocity.dao;

public class UserDaoImpl implements UserDao {
    @Override
    public String findNameById(Integer id) {
        return "suresh";                 // stands in for real DB logic
    }
    @Override
    public String findEmailById(Integer id) {
        return "suresh@gmail.com";
    }
}


// UserService.java
package com.velocity.service;

import com.velocity.dao.UserDao;

public class UserService {

    private final UserDao userDao;

    // Constructor injection: this is what makes the class testable.
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }

    public String getNameByUserId(Integer id) {
        return userDao.findNameById(id);
    }

    public String getEmailByUserId(Integer id) {
        return userDao.findEmailById(id);
    }
}

// NOTE ON THE SOURCE PDF: it also declares a no-arg
// "public UserService() { }". Keep that and someone can construct a
// UserService with a null userDao, and every method throws
// NullPointerException at runtime. Removed - and the field made final,
// so the compiler now enforces that userDao is always supplied.`]
        },

        {
            content: `<h3>The Mockito test</h3>
Three moving parts, in this order every time: <br>
• <code>@ExtendWith(MockitoExtension.class)</code> - the JUnit 5 extension that creates the mocks and verifies them afterwards. <br>
• <code>@Mock</code> - "give me a fake <code>UserDao</code>". Every method on it returns a type-appropriate default (<code>null</code>, <code>0</code>, <code>false</code>, empty collection) until you say otherwise. <br>
• <code>when(...).thenReturn(...)</code> - <strong>stubbing</strong>: "when this exact call is made, hand back this value". <br><br>

The test then asserts on what <code>UserService</code> did with that value. No database was involved at any point.`,
            codeExamples: [`package com.velocity.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.velocity.dao.UserDao;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserDao userDao;          // a fake, created by Mockito

    @Test
    public void getNameByUserIdTest() {
        when(userDao.findNameById(101)).thenReturn("suresh");

        UserService userService = new UserService(userDao);
        String name = userService.getNameByUserId(101);

        assertEquals("suresh", name);
        verify(userDao, times(1)).findNameById(101);  // and exactly once
    }

    @Test
    public void getEmailByUserIdTest() {
        when(userDao.findEmailById(101)).thenReturn("suresh@gmail.com");

        UserService userService = new UserService(userDao);
        String email = userService.getEmailByUserId(101);

        assertEquals("suresh@gmail.com", email);
    }

    @Test
    public void unknownIdReturnsNullFromUnstubbedMock() {
        UserService userService = new UserService(userDao);
        // Nothing stubbed for id 999, so the mock returns its default.
        assertEquals(null, userService.getNameByUserId(999));
    }
}

// OUTPUT:
// Tests run: 3, Failures: 0, Errors: 0
//
// Now change the expectation to assertEquals("anandrao", name) as the PDF
// does in Step-9, and:
// org.opentest4j.AssertionFailedError: expected: <anandrao> but was: <suresh>
//     at UserServiceTest.getNameByUserIdTest(UserServiceTest.java:29)`]
        },

        {
            content: `<h3>Application Flow - the full service-layer test</h3>
Putting it together on the insurance example from the fourth handout: a <code>Policy</code> entity, a <code>PolicyRepository</code>, and a <code>PolicyServiceImpl</code> that delegates to it. The service is what we are testing; the repository is what we mock. <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">    PolicyServiceImplTest
             |
             |  @InjectMocks  -> builds a REAL PolicyServiceImpl
             |                   and pushes the mocks into it
             v
      PolicyServiceImpl                (the unit under test)
             |
             |  @Mock -> PolicyRepository is a FAKE
             v
      PolicyRepository (mock)
             |
             X   no Hibernate, no JDBC, no MySQL, no schema
                 nothing below this line ever runs</pre>
<br>
<strong>@InjectMocks</strong> instantiates the class under test and injects every <code>@Mock</code> in the test class into it - by constructor if there is a matching one, otherwise by field, using reflection. That last part is why it works on a class whose <code>@Autowired</code> fields are private with no setter.`,
            codeExamples: [`// PolicyRepository.java  -- CORRECTED, see the notes below
package com.cybage.genworth.insurance.repository;

import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import com.cybage.genworth.insurance.model.Policy;

@Repository
public interface PolicyRepository extends CrudRepository<Policy, Integer> {
    // (1) The PDF writes CrudRepository<Policy, Serializable>. The second
    //     type parameter is the ID TYPE, and Policy's @Id is an Integer.
    //     Serializable makes deleteById(Object) accept anything at all and
    //     blows up at runtime instead of compile time.
    //
    // (2) The PDF then declares:
    //         public Policy findById(Integer Id);
    //     CrudRepository already inherits Optional<Policy> findById(ID).
    //     Same name, same erased parameter, different return type -
    //     that is not an override and not an overload, so javac reports:
    //     "findById(Integer) in PolicyRepository clashes with
    //      findById(ID) in CrudRepository; both methods have the same
    //      erasure, yet neither overrides the other"
    //     Deleted - use the inherited Optional-returning one.
}


// PolicyServiceImpl.java
package com.cybage.genworth.insurance.serviceimpl;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.cybage.genworth.insurance.model.Policy;
import com.cybage.genworth.insurance.repository.PolicyRepository;
import com.cybage.genworth.insurance.service.PolicyService;

@Service
public class PolicyServiceImpl implements PolicyService {

    private final PolicyRepository policyRepository;

    @Autowired
    public PolicyServiceImpl(PolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    @Override
    public Iterable<Policy> getAllPolicy() {
        return policyRepository.findAll();
    }

    @Override
    public Policy savePolicy(Policy policy) {
        return policyRepository.save(policy);
    }

    @Override
    public Policy getPolicyById(Integer id) {
        Optional<Policy> found = policyRepository.findById(id);
        return found.orElseThrow(() ->
                new PolicyNotFoundException("No policy with id " + id));
        // Returning null on a miss (as the PDF's signature implies) just
        // moves the NullPointerException into the controller.
    }

    @Override
    public void deletePolicy(Integer id) {
        policyRepository.deleteById(id);
    }
}`]
        },

        {
            content: `<h3>The corrected service test</h3>
The handout's version of this test carries four separate problems, all of them common in real projects. The corrected file is below with each one called out. <br><br>

<div class="border">
<strong>1. JUnit 4 and JUnit 5 mixed in one file.</strong> It imports <code>org.junit.Test</code> (JUnit 4) but asserts with <code>org.junit.jupiter.api.Assertions</code> (JUnit 5). Under Boot 2.4+ the JUnit 4 engine (Vintage) is not on the classpath, so the methods are silently never executed - the build goes green having run nothing at all.<br>
<strong>2. <code>@RunWith(SpringRunner.class)</code> is the JUnit 4 runner.</strong> JUnit 5 replaced runners with extensions: <code>@ExtendWith</code>.<br>
<strong>3. <code>@SpringBootTest</code> with <code>@Mock</code> is a contradiction.</strong> It boots the entire application context - including a real MySQL <code>DataSource</code> that must connect - and then does not use a single bean from it, because <code>@Mock</code> and <code>@InjectMocks</code> are plain Mockito and bypass Spring completely. Delete it and the test runs in milliseconds offline.<br>
<strong>4. <code>deletePolicyTest</code> tests nothing.</strong> It calls the mock repository directly and then asserts on the mock's own return value. The service is never invoked. It would pass with the service class deleted from the project.
</div>`,
            codeExamples: [`package com.cybage.genworth.insurance.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;                    // Jupiter, NOT org.junit.Test
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.cybage.genworth.insurance.model.Policy;
import com.cybage.genworth.insurance.repository.PolicyRepository;
import com.cybage.genworth.insurance.serviceimpl.PolicyServiceImpl;

@ExtendWith(MockitoExtension.class)      // replaces @RunWith(SpringRunner.class)
// NO @SpringBootTest here - this is a unit test, it needs no context.
public class PolicyServiceImplTest {

    @Mock
    PolicyRepository policyRepository;

    @InjectMocks
    PolicyServiceImpl policyService;

    @Test
    public void savePolicyTest() {
        Policy policy = new Policy(3, "1255", "500", "ram",
                                   "ram@gmail.com", "5012", "active");
        when(policyRepository.save(policy)).thenReturn(policy);

        assertEquals(policy, policyService.savePolicy(policy));
        verify(policyRepository).save(policy);
    }

    @Test
    public void getAllPolicyTest() {
        List<Policy> list = new ArrayList<>();
        list.add(new Policy(1, "101", "1000", "Rajaram",   "ram@gmail.com",   "2020", "active"));
        list.add(new Policy(2, "102", "2000", "Shahaji", "shyam@gmail.com", "2021", "active"));
        list.add(new Policy(3, "103", "3000", "Raghunath", "raghunath@gmail.com", "2022", "active"));

        when(policyRepository.findAll()).thenReturn(list);

        assertEquals(list, policyService.getAllPolicy());
    }

    @Test
    public void getPolicyByIdTest() {
        when(policyRepository.findById(3)).thenReturn(Optional.of(
                new Policy(3, "103", "1000", "Shahaji",
                           "shyam@gmail.com", "2022", "active")));

        Policy policy = policyService.getPolicyById(3);

        assertEquals("103",    policy.getPolicyNumber());
        assertEquals("Shahaji",  policy.getName());
        assertEquals("active", policy.getStatus());
    }

    @Test
    public void getPolicyByIdThrowsWhenMissing() {
        when(policyRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(PolicyNotFoundException.class,
                () -> policyService.getPolicyById(99));
    }

    @Test
    public void deletePolicyTest() {
        // The PDF's version calls policyRepository directly and asserts on
        // the mock. This one exercises the SERVICE and verifies that the
        // service delegated correctly - which is the only thing a mocked
        // repository can honestly tell us.
        policyService.deletePolicy(1);

        verify(policyRepository, times(1)).deleteById(1);
    }
}

// OUTPUT:
// Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
// Total time: 0.9 s   <-- no Spring context, no MySQL connection
//
// The PDF's version, run under Spring Boot 2.7+ as printed:
// Tests run: 0, Failures: 0, Errors: 0, Skipped: 0
// "No tests found" - because org.junit.Test needs the Vintage engine.`]
        },

        {
            content: `<h3>Note on the entity used by these tests</h3>
The <code>Policy</code> entity from the handout is used above. Two things about it matter for testing. <br><br>

First, <code>assertEquals(list, policyList)</code> and <code>assertEquals(policy, savedPolicy)</code> both go through <code>equals()</code>. The handout's <code>Policy</code> does not override <code>equals()</code> and <code>hashCode()</code>, so those comparisons fall back to reference identity - they pass only because the very same object instance is handed back by the mock. Change the service to copy the object and the test breaks for no good reason. <br><br>

Second, the <code>System.out.println</code> calls scattered through its constructor and setters are debugging left in production code. They will run millions of times in a live application.`,
            codeExamples: [`package com.cybage.genworth.insurance.model;

import java.util.Objects;
import javax.persistence.*;   // Spring Boot 2.x
// Spring Boot 3.x moved to Jakarta EE 9+: use jakarta.persistence.*
// (and jakarta.servlet.*, jakarta.validation.*). The javax packages
// are not merely deprecated there - they are simply not on the classpath.

@Entity
@Table(name = "policy")
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "policynumber")
    private String policyNumber;

    @Column(name = "premiumamount")
    private String premiumAmount;   // a money amount held as String is a
                                    // design smell; BigDecimal is correct

    @Column(name = "name")
    private String name;

    @Column(name = "email")
    private String email;

    @Column(name = "claimnumber")
    private String claimNumber;

    @Column(name = "status")
    private String status;

    public Policy() { }   // JPA requires the no-arg constructor

    public Policy(Integer id, String policyNumber, String premiumAmount,
                  String name, String email, String claimNumber, String status) {
        this.id = id;
        this.policyNumber = policyNumber;
        this.premiumAmount = premiumAmount;
        this.name = name;
        this.email = email;
        this.claimNumber = claimNumber;
        this.status = status;
        // The PDF prints policyNumber here and again in setPolicyNumber().
        // Removed: entity constructors and setters are on the hottest path
        // in the application.
    }

    // ... getters and setters ...

    // Added, because the tests compare Policy objects with assertEquals.
    // For a JPA entity, base equality on the BUSINESS key (the policy
    // number), never on the generated id - the id is null until flush.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Policy)) return false;
        return Objects.equals(policyNumber, ((Policy) o).policyNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(policyNumber);
    }
}`]
        }
    ],

    expert: [
        {
            content: `<h3>JUnit 4 to JUnit 5 - the migration table you will need</h3>
Almost every legacy Spring project you inherit is on JUnit 4, and the two versions are not source-compatible. JUnit 5 is not one library but three: <strong>JUnit Platform</strong> (the engine-hosting launcher that IDEs and Maven talk to), <strong>JUnit Jupiter</strong> (the new annotations and assertions), and <strong>JUnit Vintage</strong> (an engine that runs old JUnit 3/4 tests on the new platform). <br><br>

<table>
<tr><th>JUnit 4</th><th>JUnit 5 (Jupiter)</th><th>Why it changed</th></tr>
<tr><td>org.junit.Test</td><td>org.junit.jupiter.api.Test</td><td>Different package entirely - the imports are the first thing to fix</td></tr>
<tr><td>@Before</td><td>@BeforeEach</td><td>The old names never said whether they ran once or per test</td></tr>
<tr><td>@After</td><td>@AfterEach</td><td>Same</td></tr>
<tr><td>@BeforeClass</td><td>@BeforeAll</td><td>Same</td></tr>
<tr><td>@AfterClass</td><td>@AfterAll</td><td>Same</td></tr>
<tr><td>@Ignore</td><td>@Disabled</td><td>Plus richer conditional forms: @EnabledOnOs, @EnabledIfSystemProperty</td></tr>
<tr><td>@RunWith(X.class)</td><td>@ExtendWith(X.class)</td><td>A class could carry only ONE runner, which is why you could not combine Spring and Mockito runners. Extensions compose - you can stack as many as you like</td></tr>
<tr><td>@Test(expected = Foo.class)</td><td>assertThrows(Foo.class, () -&gt; ...)</td><td>The old form passed if the exception came from ANYWHERE in the method, including the setup lines. assertThrows pins it to one expression and hands the exception back so you can assert on its message</td></tr>
<tr><td>@Test(timeout = 100)</td><td>assertTimeout / @Timeout</td><td>Same reasoning</td></tr>
<tr><td>@Rule, @ClassRule</td><td>Extensions</td><td>Rules and runners were two separate extension mechanisms; Jupiter has one</td></tr>
<tr><td>org.junit.Assert</td><td>org.junit.jupiter.api.Assertions</td><td>Message parameter moved to the LAST argument, so it can be a lazily-evaluated Supplier</td></tr>
</table>
<br>
The failure mode that costs teams a whole afternoon: mix the two in one file and the build stays green while running nothing. A JUnit 4 <code>@Test</code> method in a project without the Vintage engine is not an error - the Jupiter engine simply does not recognise it, reports zero tests, and Maven is perfectly happy. Configure <code>failIfNoTests</code>, or better, keep <code>maven-surefire-plugin</code> current and watch the "Tests run:" count.`,
            codeExamples: [`// ---------- JUnit 4, the way legacy Spring tests look ----------
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringRunner;
import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)          // ONE runner per class - the whole problem
@SpringBootTest
public class LegacyPolicyServiceTest {

    private PolicyService service;

    @Before
    public void setUp() { service = new PolicyServiceImpl(repo); }

    @Test(expected = PolicyNotFoundException.class)
    public void throwsWhenMissing() {
        service.getPolicyById(99);
    }

    @Test
    public void message() {
        assertEquals("wrong count", 3, service.count());  // message FIRST
    }
}


// ---------- The same file on JUnit 5 ----------
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)   // extensions STACK - add more freely
class PolicyServiceTest {

    private PolicyService service;

    @BeforeEach
    void setUp() { service = new PolicyServiceImpl(repo); }

    @Test
    void throwsWhenMissing() {
        PolicyNotFoundException ex = assertThrows(
                PolicyNotFoundException.class,
                () -> service.getPolicyById(99));
        assertEquals("No policy with id 99", ex.getMessage());
        // JUnit 4's expected= could not do this second line at all.
    }

    @Test
    void message() {
        assertEquals(3, service.count(), "wrong count");  // message LAST
    }
}

// Note also: JUnit 5 test classes and methods need no "public" modifier.
// Package-private is the convention, and it keeps the API surface honest.

// OUTPUT of a silent mixed-version failure:
// [INFO] Tests run: 0, Failures: 0, Errors: 0, Skipped: 0
// [INFO] BUILD SUCCESS      <-- 40 test methods, none of them executed`]
        },

        {
            content: `<h3>@Mock versus @MockBean, and the real cost of @MockBean</h3>
Both hand you a Mockito mock. They differ in where that mock lives, and the difference is measured in minutes of CI time. <br><br>

<table>
<tr><th>Aspect</th><th>@Mock (Mockito)</th><th>@MockBean (Spring Boot Test)</th></tr>
<tr><td>Package</td><td>org.mockito.Mock</td><td>org.springframework.boot.test.mock.mockito.MockBean</td></tr>
<tr><td>Needs a Spring context</td><td>No</td><td>Yes - there is nothing to register the mock into otherwise</td></tr>
<tr><td>What it does</td><td>Creates an object</td><td>Creates an object AND replaces the matching bean definition in the ApplicationContext</td></tr>
<tr><td>Injected by</td><td>@InjectMocks, or your own constructor call</td><td>Spring's normal autowiring, into every collaborator</td></tr>
<tr><td>Reset between tests</td><td>New mocks per test method</td><td>Reset after each test method (Boot does this for you)</td></tr>
<tr><td>Startup cost</td><td>Microseconds</td><td>A fresh application context - seconds</td></tr>
</table>
<br>
The cost is not the mock, it is what the mock does to the <strong>test context cache</strong>. Spring caches a loaded <code>ApplicationContext</code> and reuses it across every test class whose configuration key is identical, so a hundred test classes can share one three-second startup. The set of <code>@MockBean</code> declarations is <strong>part of that cache key</strong>. Two test classes that mock different beans - or the same beans in a different combination - are two different keys, so they get two different contexts, each paying full startup cost. <br><br>

<div class="border">
<strong>Rule</strong>: use <code>@Mock</code> whenever the test does not need Spring at all - which is nearly every service-layer test.<br>
Use <code>@MockBean</code> only when a context is genuinely being loaded anyway (<code>@WebMvcTest</code>, <code>@SpringBootTest</code>) and something inside it must be replaced.<br>
Keep the set of mocked beans <strong>identical across classes</strong> where you can - often by hoisting them into a shared abstract base class - so they share one cached context.<br>
On Spring Boot 3.4+, <code>@MockBean</code> is deprecated in favour of <code>@MockitoBean</code> (and <code>@MockitoSpyBean</code>), which is the Spring Framework 6.2 equivalent. The caching behaviour is the same.
</div>`,
            codeExamples: [`// Each of these three classes gets its OWN application context,
// because the mock set is part of the cache key.

@SpringBootTest
class OrderFlowTest {
    @MockBean PaymentGateway gateway;                       // key: {PaymentGateway}
}

@SpringBootTest
class RefundFlowTest {
    @MockBean PaymentGateway gateway;
    @MockBean AuditLog auditLog;                            // key: {PaymentGateway, AuditLog}
}

@SpringBootTest
class ShipmentFlowTest {
    @MockBean CourierClient courier;                        // key: {CourierClient}
}

// OUTPUT (Maven, 40-bean application):
// Started OrderFlowTest    in 3.812 seconds
// Started RefundFlowTest   in 3.744 seconds   <-- cold, different key
// Started ShipmentFlowTest in 3.690 seconds   <-- cold, different key
// Total: ~11 s of startup for 3 test classes.


// Hoist the mocks into a shared base and all three share ONE context:
@SpringBootTest
abstract class AbstractFlowTest {
    @MockBean PaymentGateway gateway;
    @MockBean AuditLog       auditLog;
    @MockBean CourierClient  courier;
}

class OrderFlowTest    extends AbstractFlowTest { /* ... */ }
class RefundFlowTest   extends AbstractFlowTest { /* ... */ }
class ShipmentFlowTest extends AbstractFlowTest { /* ... */ }

// OUTPUT:
// Started OrderFlowTest    in 3.855 seconds
// Started RefundFlowTest   in 0.021 seconds   <-- cache hit
// Started ShipmentFlowTest in 0.018 seconds   <-- cache hit
// Total: ~3.9 s. Same coverage, one third of the wall clock.


// Boot 3.4+ replacement:
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class OrderFlowTest {
    @MockitoBean PaymentGateway gateway;   // @MockBean is deprecated
}`]
        },

        {
            content: `<h3>verify() and ArgumentCaptor - asserting on interactions, not values</h3>
<code>assertEquals</code> checks what came back. Sometimes the interesting behaviour has no return value at all: a <code>void</code> notification method, a delete, an audit write. For those, the only observable evidence is <strong>which calls the unit made on its collaborators</strong>. <br><br>

<table>
<tr><th>Construct</th><th>Meaning</th></tr>
<tr><td>verify(mock).method(arg)</td><td>Was called exactly once with that argument. Shorthand for <code>times(1)</code>.</td></tr>
<tr><td>verify(mock, times(n))</td><td>Called exactly n times.</td></tr>
<tr><td>verify(mock, never())</td><td>Never called - the assertion people forget. "We must NOT charge the card when validation fails" is a real requirement.</td></tr>
<tr><td>verify(mock, atLeastOnce() / atMost(n))</td><td>Loose bounds, for retry logic.</td></tr>
<tr><td>verifyNoMoreInteractions(mock)</td><td>Nothing beyond what you already verified. Use sparingly - it makes tests brittle against harmless refactoring.</td></tr>
<tr><td>InOrder</td><td>Calls happened in a specific sequence across one or several mocks.</td></tr>
<tr><td>ArgumentCaptor</td><td>Grabs the actual object that was passed, so you can assert on its fields afterwards.</td></tr>
</table>
<br>
<strong>ArgumentCaptor</strong> earns its keep when the unit constructs the argument itself. If the service builds an <code>AuditEvent</code> internally and hands it to the repository, you cannot write <code>verify(repo).save(expectedEvent)</code> without an <code>equals()</code> on <code>AuditEvent</code> and a way to predict its timestamp. Capture it instead and assert on the fields you actually care about. <br><br>

A caution on over-use: <code>verify()</code> asserts on <strong>implementation</strong>. A test that verifies six interactions has to be rewritten every time the method is refactored, even when its behaviour is unchanged. Prefer asserting the outcome; reach for <code>verify()</code> when there is no outcome to assert.`,
            codeExamples: [`import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InOrder;

@ExtendWith(MockitoExtension.class)
class PolicyCancellationServiceTest {

    @Mock PolicyRepository repository;
    @Mock NotificationSender sender;
    @Mock AuditLog          auditLog;

    @InjectMocks PolicyCancellationService service;

    @Captor ArgumentCaptor<AuditEvent> auditCaptor;

    @Test
    void cancellingAnActivePolicyAuditsAndNotifiesOnce() {
        Policy active = new Policy(7, "P-700", "1000", "Rajaram",
                                   "ram@x.com", "C-1", "active");
        when(repository.findById(7)).thenReturn(Optional.of(active));

        service.cancel(7, "customer request");

        // 1. void method: the only evidence is the interaction
        verify(sender, times(1)).sendCancellationEmail("ram@x.com");

        // 2. the negative assertion - just as important
        verify(sender, never()).sendRenewalReminder(anyString());

        // 3. capture the object the service BUILT internally
        verify(auditLog).record(auditCaptor.capture());
        AuditEvent captured = auditCaptor.getValue();
        assertEquals("POLICY_CANCELLED", captured.getType());
        assertEquals("P-700",            captured.getPolicyNumber());
        assertEquals("customer request", captured.getReason());
        assertNotNull(captured.getTimestamp());   // can't predict it, but
                                                  // can insist it is set

        // 4. ordering matters here: audit BEFORE the email goes out,
        //    so a crash mid-way never emails without a record
        InOrder order = inOrder(auditLog, sender);
        order.verify(auditLog).record(any(AuditEvent.class));
        order.verify(sender).sendCancellationEmail("ram@x.com");
    }

    @Test
    void cancellingAnAlreadyCancelledPolicyDoesNothing() {
        Policy done = new Policy(8, "P-800", "1000", "Sonopant",
                                 "sita@x.com", "C-2", "cancelled");
        when(repository.findById(8)).thenReturn(Optional.of(done));

        service.cancel(8, "duplicate request");

        verifyNoInteractions(sender);   // no email
        verify(repository, never()).save(any());
    }
}

// OUTPUT when the service forgets to audit:
// org.mockito.exceptions.verification.WantedButNotInvoked:
// Wanted but not invoked:
// auditLog.record(<Capturing argument>);
// -> at PolicyCancellationServiceTest.cancelling...(line 41)
// However, there were other interactions with this mock:
// auditLog.debug("cancel called");
// -> at PolicyCancellationService.cancel(PolicyCancellationService.java:22)

// OUTPUT when it sends two emails instead of one:
// org.mockito.exceptions.verification.TooManyActualInvocations:
// sender.sendCancellationEmail("ram@x.com");
// Wanted 1 time, but was 2 times.`]
        },

        {
            content: `<h3>Strict stubs, argument matchers, and the errors they produce</h3>
Since Mockito 2, <code>MockitoExtension</code> runs in <code>Strictness.STRICT_STUBS</code> by default. This is a feature, and the two errors it produces are the most-searched Mockito messages in existence. <br><br>

<strong>UnnecessaryStubbingException</strong> - you stubbed something the test never called. Almost always it means the arguments do not match what the code actually passes (you stubbed <code>findById(101)</code>, the code calls <code>findById(1)</code>), or the stub is left over from a refactoring. Deleting the stub is usually right; <code>lenient()</code> silences it and should be rare. <br><br>

<strong>PotentialStubbingProblem</strong> - the mock was called with arguments no stub matches. Under the old lenient default it would have quietly returned <code>null</code> and you would have chased a <code>NullPointerException</code> five frames away. <br><br>

<strong>Argument matchers</strong> (<code>any()</code>, <code>eq()</code>, <code>argThat()</code>) have one rule that catches everybody: if you use a matcher for one argument, you must use matchers for <strong>all</strong> of them. <code>when(repo.find(any(), 5))</code> throws <code>InvalidUseOfMatchersException</code>; write <code>when(repo.find(any(), eq(5)))</code>. And prefer specific matchers to <code>any()</code> - <code>any()</code> makes a stub match calls it was never meant to. <br><br>

For <code>void</code> methods the <code>when()</code> syntax does not compile at all; use <code>doThrow(...).when(mock).method()</code> or <code>doNothing()</code>.`,
            codeExamples: [`// ---- UnnecessaryStubbingException ----
@Test
void stubbedTheWrongId() {
    when(repository.findById(101)).thenReturn(Optional.of(policy));
    service.getPolicyById(1);        // 1, not 101
}
// OUTPUT:
// org.mockito.exceptions.misusing.UnnecessaryStubbingException:
// Unnecessary stubbings detected.
// Clean & maintainable test code requires zero unnecessary code.
// 1. -> at PolicyServiceTest.stubbedTheWrongId(PolicyServiceTest.java:31)


// ---- PotentialStubbingProblem ----
// OUTPUT:
// org.mockito.exceptions.misusing.PotentialStubbingProblem:
// Strict stubbing argument mismatch. Please check:
//  - this invocation of 'findById' method:
//      policyRepository.findById(1);
//  - has following stubbing(s) with different arguments:
//      1. policyRepository.findById(101);


// ---- Matcher rules ----
when(repository.findByStatusAndYear(any(), 2024));        // WRONG
// org.mockito.exceptions.misusing.InvalidUseOfMatchersException:
// Invalid use of argument matchers! 2 matchers expected, 1 recorded.

when(repository.findByStatusAndYear(any(), eq(2024)));    // right

// Better still - be specific, so the stub cannot match by accident:
when(repository.findByStatusAndYear(eq("active"), eq(2024)))
        .thenReturn(List.of(policy));

// argThat for a condition on the object:
verify(auditLog).record(argThat(e -> e.getType().equals("POLICY_CANCELLED")));


// ---- void methods: do*() family, not when() ----
doNothing().when(sender).sendCancellationEmail(anyString());

doThrow(new MailServerDownException("smtp timeout"))
        .when(sender).sendCancellationEmail("ram@x.com");

// Consecutive answers - first call fails, retry succeeds:
when(gateway.charge(100))
        .thenThrow(new TimeoutException())
        .thenReturn(true);

assertTrue(service.chargeWithRetry(100));
verify(gateway, times(2)).charge(100);


// ---- Deliberately lenient, when a base class stubs for all subclasses ----
lenient().when(clock.now()).thenReturn(FIXED_INSTANT);


// ---- Spy: real object, selected methods overridden ----
// Useful for legacy classes you cannot refactor. Note the do*() form:
// spy.expensiveCall() would actually EXECUTE before being stubbed.
PolicyServiceImpl real = new PolicyServiceImpl(repository);
PolicyServiceImpl spy  = Mockito.spy(real);
doReturn(BigDecimal.ZERO).when(spy).calculatePremium(any());   // correct
// when(spy.calculatePremium(any())).thenReturn(...);          // executes it`]
        },

        {
            content: `<h3>PowerMock: why the handout's advice should not be followed</h3>
The source classifies mock frameworks as "stub based" (EasyMock) versus "byte code manipulation based" (PowerMock) and recommends the latter. That taxonomy has not described the landscape for over a decade, and the recommendation is actively harmful on a modern project. <br><br>

<table>
<tr><th>Claim in the source</th><th>Reality</th></tr>
<tr><td>EasyMock is "stub based" and cannot mock final or private members</td><td>The final/private limitation is real, but it applied to <strong>every</strong> mainstream mock framework, Mockito included, because they all worked by generating a subclass - and you cannot subclass a final class or override a private method</td></tr>
<tr><td>PowerMock is byte-code based and therefore preferred</td><td>PowerMock achieves this with a custom classloader that rewrites bytecode at load time. That is precisely why it breaks: it is coupled to the internals of both JUnit and the JDK, and every JDK upgrade has historically stranded it</td></tr>
<tr><td>Use <code>powermock-module-junit4</code> and <code>powermock-api-mockito2</code></td><td>The artifact name says <strong>junit4</strong>. It runs through <code>@RunWith(PowerMockRunner.class)</code>, which does not exist in JUnit 5. Combined with the handout's Jupiter assertions, the file cannot work as printed. PowerMock has no supported JUnit 5 runner</td></tr>
<tr><td>You need it to mock static methods</td><td>Mockito 3.4+ has <code>mockStatic()</code> built in. Mockito 5's default <code>mockito-inline</code> maker also mocks final classes and final methods without any extra dependency</td></tr>
</table>
<br>
<strong>Mockito 5 (the default in Spring Boot 3.x) uses the inline mock maker</strong>, which instruments classes through the Java agent API rather than by subclassing. Final classes, final methods, static methods and constructors are all mockable out of the box, on modern JDKs, with JUnit 5. There is no remaining reason to add PowerMock to a new project. <br><br>

The deeper point: needing to mock a static method is nearly always a design signal. <code>LocalDateTime.now()</code> scattered through a service makes it untestable; injecting a <code>java.time.Clock</code> makes it trivially testable and is better production code besides.`,
            codeExamples: [`// ---- The handout's approach (do not use) ----
// pom.xml
//   org.powermock:powermock-module-junit4:2.0.9       <- JUnit 4 only
//   org.powermock:powermock-api-mockito2:2.0.9
//
// UserDao userDaoTest = PowerMockito.mock(UserDao.class);
// PowerMockito.when(userDaoTest.findNameById(101)).thenReturn("suresh");
//
// For a plain interface, PowerMockito.mock() is doing nothing that
// Mockito.mock() would not do - the extra dependency buys nothing here.


// ---- Plain Mockito, no extra dependency ----
UserDao userDao = Mockito.mock(UserDao.class);
when(userDao.findNameById(101)).thenReturn("suresh");


// ---- Mocking a static method - Mockito 3.4+, no PowerMock ----
// Scope it in try-with-resources: the mock is thread-local and MUST be
// closed, or every later test in the same thread sees the stub.
@Test
void invoiceNumberUsesTodaysDate() {
    LocalDate fixed = LocalDate.of(2024, 3, 1);

    try (MockedStatic<LocalDate> mocked = Mockito.mockStatic(LocalDate.class)) {
        mocked.when(LocalDate::now).thenReturn(fixed);

        assertEquals("INV-2024-03-0001", invoiceService.nextNumber());
    }
    // stub is gone here
}

// OUTPUT if you forget the try-with-resources:
// org.mockito.exceptions.base.MockitoException:
// For java.time.LocalDate, static mocking is already registered in the
// current thread. To create a new mock, the existing static mock must
// be deregistered.


// ---- Better than mocking statics: inject a Clock ----
@Service
public class InvoiceService {

    private final Clock clock;

    public InvoiceService(Clock clock) { this.clock = clock; }
    // In production, expose @Bean Clock clock() { return Clock.systemUTC(); }

    public String nextNumber() {
        LocalDate today = LocalDate.now(clock);
        return String.format("INV-%d-%02d-0001",
                today.getYear(), today.getMonthValue());
    }
}

@Test
void invoiceNumberUsesTodaysDate() {
    Clock fixed = Clock.fixed(Instant.parse("2024-03-01T00:00:00Z"), ZoneOffset.UTC);
    assertEquals("INV-2024-03-0001", new InvoiceService(fixed).nextNumber());
    // No bytecode instrumentation, no classloader tricks, no thread-local
    // cleanup. And the production code is now explicit about its dependency
    // on time, which is a genuine improvement.
}`]
        },

        {
            content: `<h3>What deserves a test, and why getters and setters do not</h3>
Coverage percentage is a diagnostic, not a target. Chase 100% and the cheapest way to get there is to test the code that cannot break, which inflates the number while testing nothing. <br><br>

<table>
<tr><th>Code</th><th>Test it?</th></tr>
<tr><td>Plain getters and setters</td><td>No. They contain no decision, no branch, nothing that a compiler would not already catch. A test asserting <code>setName("x")</code> then <code>getName()</code> equals "x" is asserting that Java field assignment works</td></tr>
<tr><td>Generated code - Lombok, MapStruct, toString(), builders</td><td>No. You would be testing the generator, and its authors already did</td></tr>
<tr><td>Framework wiring - "does this @Service get autowired"</td><td>No, beyond a single context-loads smoke test for the whole application</td></tr>
<tr><td>Business rules with branches - eligibility, pricing, discounts, state machines</td><td>Yes, and this is where most of your tests should live</td></tr>
<tr><td>Boundary conditions - null, empty, zero, negative, off-by-one, maximum values</td><td>Yes. Most production defects are boundary defects</td></tr>
<tr><td>Error paths - what happens when the dependency throws</td><td>Yes. This is the code that runs during an incident, and it is nearly always the least-exercised code in the system</td></tr>
<tr><td>Every bug you fix</td><td>Yes - write the failing test first. It proves the diagnosis and pins the fix permanently</td></tr>
<tr><td>Custom repository queries (JPQL, native SQL, derived method names)</td><td>Yes, but not with a mock - a mocked repository returns whatever you told it and can never catch a broken query. This needs a real database; see the integration testing topic</td></tr>
<tr><td>equals() and hashCode() when hand-written</td><td>Yes. Getting the contract wrong silently corrupts every HashMap and HashSet the object touches</td></tr>
</table>
<br>
<strong>The economic test</strong>: would this test have caught a defect that actually reached production, and will it still pass after a legitimate refactoring? If the answer to the first is no, it is not earning its maintenance cost. If the answer to the second is no, it is testing implementation rather than behaviour and will be deleted in frustration six months from now. <br><br>

A useful discipline for judging a suite is <strong>mutation testing</strong> (PIT on the JVM). It changes your production code - flips a <code>&gt;</code> to <code>&gt;=</code>, returns null instead of a value - and re-runs your tests. Any mutation that survives is a line your suite covers but does not actually check. Line coverage of 90% with a mutation score of 30% is the classic profile of a suite full of getter tests.`,
            codeExamples: [`// ---- Noise: this passes forever and catches nothing ----
@Test
void testGetSetName() {
    Policy p = new Policy();
    p.setName("Rajaram");
    assertEquals("Rajaram", p.getName());
}
// Adds a line to the coverage report. Would not detect any realistic bug.


// ---- Value: the branches are where defects live ----
class PremiumCalculatorTest {

    private final PremiumCalculator calc = new PremiumCalculator();

    @ParameterizedTest(name = "age {0}, claims {1} -> loading {2}")
    @CsvSource({
        "17,  0, 0.00",   // below minimum age - rejected elsewhere
        "18,  0, 0.15",   // youngest accepted band
        "24,  0, 0.15",   // top of the young-driver band
        "25,  0, 0.00",   // first year out of it: the off-by-one
        "40,  0, 0.00",
        "69,  0, 0.00",
        "70,  0, 0.10",   // senior band begins
        "40,  1, 0.20",   // one claim
        "40,  3, 0.60",   // multiple claims
        "40, 10, 1.00"    // capped, not 2.00
    })
    void loadingIsAppliedAtEveryBoundary(int age, int claims, BigDecimal expected) {
        assertEquals(expected, calc.loadingFor(age, claims));
    }

    @Test
    void negativeClaimCountIsRejected() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> calc.loadingFor(40, -1));
        assertEquals("claims must not be negative", ex.getMessage());
    }

    @Test
    void gatewayFailureIsTranslatedNotLeaked() {
        when(gateway.charge(any())).thenThrow(new SocketTimeoutException());

        assertThrows(PaymentUnavailableException.class,
                () -> service.pay(policy));
        verify(repository, never()).markPaid(any());  // no partial state
    }
}

// OUTPUT:
// loadingIsAppliedAtEveryBoundary(int, int, BigDecimal)
//   |- [1] age 17, claims 0 -> loading 0.00   PASSED
//   |- [2] age 18, claims 0 -> loading 0.15   PASSED
//   |- [4] age 25, claims 0 -> loading 0.00   FAILED
//        expected: <0.00> but was: <0.15>
//   ...
// The off-by-one at 25 is a real bug in a real pricing rule, found by
// one row of a CSV. Ten getter tests would never have found it.


// ---- PIT mutation testing, run over a getter-heavy suite ----
// >>> Generated 214 mutations, Killed 61 (29%)
// >>> Line Coverage: 402/441 (91%)
// 91% covered, 29% actually verified.`]
        },

        {
            content: `<h3>Running tests from the command line and in CI</h3>
The IDE's "Run As -&gt; JUnit Test" is fine for the loop you are in; the build is what gates the merge. <strong>Maven Surefire</strong> runs unit tests during the <code>test</code> phase and fails the build on the first failure. <br><br>

<table>
<tr><th>Command</th><th>Effect</th></tr>
<tr><td>mvn test</td><td>Compile and run everything Surefire matches: <code>*Test.java</code>, <code>Test*.java</code>, <code>*Tests.java</code>, <code>*TestCase.java</code></td></tr>
<tr><td>mvn -Dtest=PolicyServiceImplTest test</td><td>One class</td></tr>
<tr><td>mvn -Dtest=PolicyServiceImplTest#savePolicyTest test</td><td>One method</td></tr>
<tr><td>mvn -DskipTests package</td><td>Compile the tests but do not run them</td></tr>
<tr><td>mvn -Dmaven.test.skip=true package</td><td>Do not even compile them - which hides compilation breakage in test code, so avoid it</td></tr>
<tr><td>mvn -DfailIfNoTests=true test</td><td>Fail rather than pass when zero tests ran - the guard against the silent JUnit 4/5 mix-up</td></tr>
<tr><td>mvn verify</td><td>Runs Surefire, then <strong>Failsafe</strong> for <code>*IT.java</code> integration tests, with proper pre/post-integration phases</td></tr>
</table>
<br>
Keep unit tests in Surefire and integration tests in Failsafe. Surefire failing stops the build immediately; Failsafe defers its failure until after the <code>post-integration-test</code> phase, so containers and servers still get shut down cleanly. A JUnit 5 <code>@Tag</code> gives the same split within one plugin if you prefer.`,
            codeExamples: [`<!-- pom.xml: split fast unit tests from slow integration tests -->
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-surefire-plugin</artifactId>
      <configuration>
        <excludedGroups>integration</excludedGroups>
        <failIfNoTests>true</failIfNoTests>
      </configuration>
    </plugin>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-failsafe-plugin</artifactId>
      <executions>
        <execution>
          <goals>
            <goal>integration-test</goal>
            <goal>verify</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>

// Tag the slow ones:
@Tag("integration")
@SpringBootTest
class PolicyEndToEndIT { /* ... */ }

// OUTPUT of mvn test (unit tests only):
// [INFO] --- maven-surefire-plugin:3.2.5:test ---
// [INFO] Running com.cybage.PolicyServiceImplTest
// [INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.412 s
// [INFO] Running com.cybage.PremiumCalculatorTest
// [INFO] Tests run: 11, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.088 s
// [INFO] Results:
// [INFO] Tests run: 16, Failures: 0, Errors: 0, Skipped: 0
// [INFO] BUILD SUCCESS
// [INFO] Total time: 6.1 s

// OUTPUT of a failure - note the exit code, which is what CI reads:
// [ERROR] PolicyServiceImplTest.getPolicyByIdTest:58
//         expected: <103> but was: <104>
// [ERROR] Tests run: 5, Failures: 1, Errors: 0, Skipped: 0
// [INFO] BUILD FAILURE
// $ echo $?
// 1`]
        },

        {
            content: `<h3>Interview Questions</h3>
<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What replaced @Before and @BeforeClass in JUnit 5?</td><td>@BeforeEach and @BeforeAll. The names now state explicitly whether the hook runs per test method or once per class, which the JUnit 4 names never did. @BeforeAll must still be static unless the class is annotated @TestInstance(Lifecycle.PER_CLASS).</td></tr>
<tr><td>Why did @RunWith become @ExtendWith?</td><td>A JUnit 4 class could carry only one @RunWith runner, so you could not combine SpringRunner and MockitoJUnitRunner. JUnit 5 extensions compose - you can stack @ExtendWith declarations freely, and Spring Boot's slice annotations are themselves meta-annotated with @ExtendWith(SpringExtension.class).</td></tr>
<tr><td>What is wrong with @Test(expected = Foo.class)?</td><td>It passes if the exception comes from anywhere in the method, including setup lines that were never meant to throw, and it gives you no handle on the exception object. assertThrows pins the expectation to one expression and returns the exception so you can assert on its message and fields.</td></tr>
<tr><td>What happens if you mix org.junit.Test with JUnit 5 in a Spring Boot 2.4+ project?</td><td>The Vintage engine is not on the classpath, so the Jupiter engine does not recognise those methods, reports zero tests, and the build passes having executed nothing. Guard against it with failIfNoTests and by watching the "Tests run:" count.</td></tr>
<tr><td>What is the difference between @Mock and @MockBean?</td><td>@Mock is plain Mockito with no Spring involvement, injected via @InjectMocks or your own constructor call. @MockBean creates a Mockito mock and registers it in the Spring ApplicationContext, replacing the real bean definition everywhere it is autowired - so it requires a context to be loading.</td></tr>
<tr><td>Why is @MockBean expensive?</td><td>The set of @MockBean declarations forms part of the Spring test context cache key. Any class with a different combination of mocked beans cannot reuse a cached context and pays a full startup. Hoisting a common set of mocks into a shared abstract base class restores the cache hit.</td></tr>
<tr><td>What does @InjectMocks actually do?</td><td>It instantiates the class under test and pushes every @Mock declared in the test class into it - preferring the biggest matching constructor, then falling back to setter and then field injection by reflection. That reflection fallback is why it works on classes with private @Autowired fields and no constructor.</td></tr>
<tr><td>What is UnnecessaryStubbingException and why does it exist?</td><td>Strict stubs (the default under MockitoExtension) fail a test that stubs a call the code never makes. It almost always means the stubbed arguments do not match the real ones, which under the old lenient default would have silently returned null and surfaced as a confusing NullPointerException elsewhere.</td></tr>
<tr><td>When would you use ArgumentCaptor instead of asserting on a return value?</td><td>When the unit constructs the argument internally and passes it to a collaborator - an audit event, a mapped DTO, an email message. You cannot predict the object to match it with eq(), so you capture what was actually passed and assert on the fields that matter.</td></tr>
<tr><td>Why should you not use PowerMock on a new project?</td><td>It is built on a JUnit 4 runner with no JUnit 5 equivalent, uses a custom classloader coupled to JDK internals, and everything it was needed for - final classes, final and static methods - Mockito 3.4+ and the inline mock maker now do natively with no extra dependency.</td></tr>
<tr><td>How do you test code that calls LocalDateTime.now()?</td><td>Preferably by not needing to: inject a java.time.Clock and call LocalDate.now(clock), so the test supplies Clock.fixed(). If the call is in code you cannot change, Mockito.mockStatic() in a try-with-resources block works, but it is thread-local and must be closed.</td></tr>
<tr><td>Why is testing getters and setters considered noise?</td><td>They contain no decision or branch, so no realistic defect can hide in them. Such tests raise line coverage without raising the number of bugs the suite can detect - a gap that mutation testing tools like PIT expose immediately as a high coverage percentage with a low mutation score.</td></tr>
<tr><td>Your service test mocks the repository and passes. What class of bug can it still not catch?</td><td>Anything below the mock: a broken JPQL or derived query, a wrong column mapping, a missing constraint, a lazy-loading failure. The mock returns whatever it was told to. Queries have to be exercised against a real database, which is what @DataJpaTest and Testcontainers are for.</td></tr>
</table>`
        }
    ]
};
