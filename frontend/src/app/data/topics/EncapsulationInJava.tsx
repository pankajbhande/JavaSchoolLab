import { Topic } from '../coreJava';

export const encapsulationInJava: Topic = {
                        id: `Encapsulation in Java`,
                        name: `Encapsulation in Java`,
                        beginner: [
                            {
                                content: `• Encapsulation in Java is a core Object-Oriented Programming (OOP) concept where the data (variables) and the code (methods) that operate on that data are bundled together as a single unit, which is typically a class. <br>
                • This mechanism is also known as data hiding because it restricts direct access to the class's internal state. <br>
                • The main idea is to hide the internal implementation details from the outside world and provide controlled access through well-defined public methods (getters and setters). <br><br>

                <h4>How to Achieve Encapsulation in Java</h4>
To implement encapsulation, you follow these steps: <br>
1. Declare variables as private: This prevents other classes from accessing the data directly. The variables are only accessible within their own class.<br>
2. Provide public getter and setter methods: These methods allow controlled, indirect access to the private variables.<br>
3. Getter methods (getXXX()) are used to retrieve the values of the variables.<br>
4. Setter methods (setXXX()) are used to modify the values of the variables and can include validation logic to ensure data integrity. <br>

Below is one small, runnable code + output (proof) for every step: <br>`
                            },

                            {
                                content: `<h4>Step 1: Declare variables as private</h4>
Proof: trying to touch the field directly from outside the class fails to compile.`,
                                codeExamples: [`public class Person {
    private String name; // cannot be touched directly from outside this class
}

public class Main {
    public static void main(String[] args) {
        Person person = new Person();
        // person.name = "Pankaj";
        // COMPILE ERROR: name has private access in Person
    }
}`]
                            },

                            {
                                content: `<h4>Step 2: Provide a public getter method</h4>
The getter (getXXX()) is the only way to read the private field from outside the class.`,
                                codeExamples: [`public class Person {
    private String name = "Pankaj";

    public String getName() { // Getter
        return name;
    }

    public static void main(String[] args) {
        Person person = new Person();
        System.out.println("Person's Name: " + person.getName());
    }
}
// OUTPUT:
// Person's Name: Pankaj`]
                            },

                            {
                                content: `<h4>Step 3: Provide a public setter method (with validation)</h4>
The setter (setXXX()) is the only way to change the private field, and can reject bad values.`,
                                codeExamples: [`public class Person {
    private int age;

    public void setAge(int age) { // Setter with validation
        if (age > 0) {
            this.age = age;
        } else {
            System.out.println("Age must be positive");
        }
    }

    public int getAge() {
        return age;
    }

    public static void main(String[] args) {
        Person person = new Person();
        person.setAge(25);
        System.out.println("Person's Age: " + person.getAge());
        person.setAge(-5); // rejected by validation
        System.out.println("Person's Age: " + person.getAge());
    }
}
// OUTPUT:
// Person's Age: 25
// Age must be positive
// Person's Age: 25`]
                            },

                            {
                                content: `<h4>Step 4: Putting it all together</h4>
Full Person class with private fields, getters, and setters — this is a complete encapsulated class.`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Person {
//------------------------------------------------------
// Private variables
private String name;
private int age;
//------------------------------------------------------
// Public getter method for name
public String getName() {
return name;
}
// Public setter method for name
public void setName(String name) {
this.name = name;
}
// Public getter method for age
public int getAge() {
return age;
}
// Public setter method for age
public void setAge(int age) {
if (age > 0) { // Simple validation
this.age = age;
} else {
System.out.println("Age must be positive");
}
}
//------------------------------------------------------
// Method to display information
public void displayInfo() {
System.out.println("Name: " + name);
System.out.println("Age: " + age);
}
//------------------------------------------------------
}
package com.javaschoollab.demo;
public class Main {
public static void main(String[] args) {
// Creating an object of Person class
Person person = new Person();
// Using setter methods to set values
person.setName("Pankaj");
person.setAge(100);
// Using getter methods to access values
System.out.println("Person's Name: " + person.getName());
System.out.println("Person's Age: " + person.getAge());
// Display information using displayInfo method
person.displayInfo();
}
}
// OUTPUT:
// Person's Name: Pankaj
// Person's Age: 100
// Name: Pankaj
// Age: 100
`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `The binding of data into single entity called as "Encapsulation".

                Example- Class is the entity which contains variables & methods.

                <div class="bg-secondary border border-primary p-2">
                Class Employee { <br>
int salary; <br>
void m5() {<br>
statements ;<br>
}<br>
}<br>
                </div>`
                            },
                            {
                                content: `Through encapsulation, data is hidden and protected from access by outside non-member methods of a class.<br>
Only member methods defined in a class will have access to the data.<br><br>
A Java class is an example of encapsulation because class binds variables and methods together.<br>
<div class="bg-secondary border border-primary p-2">
<h3>Key Concepts of Encapsulation:</h3>
<h4>1. Private Variables:</h4>
 • How: Declare class variables as private so they cannot be accessed directly from outside the class.<br>
 • Why: This restricts external code from directly accessing and modifying the internal state of the
object, ensuring data integrity.<br>
<h4>2. Public Getter and Setter Methods:</h4>
 • How: Provide public methods (getters and setters) to access and update the private variables.<br>
 • Why: This allows controlled access to the internal state of the object. You can add logic to these
methods to validate data before it is changed.<br>
</div>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Person {
//------------------------------------------------------
// Private variables
private String name;
private int age;
//------------------------------------------------------
// Public getter method for name
public String getName() {
return name;
}
// Public setter method for name
public void setName(String name) {
this.name = name;
}
// Public getter method for age
public int getAge() {
return age;
}
// Public setter method for age
public void setAge(int age) {
if (age > 0) { // Simple validation
this.age = age;
} else {
System.out.println("Age must be positive");
}
}
//------------------------------------------------------
// Method to display information
public void displayInfo() {
System.out.println("Name: " + name);
System.out.println("Age: " + age);
}
//------------------------------------------------------
}
public class Main {
public static void main(String[] args) {
// Creating an object of Person class
Person person = new Person();
// Using setter methods to set values
person.setName("Pankaj");
person.setAge(100);
// Using getter methods to access values
System.out.println("Person's Name: " + person.getName());
System.out.println("Person's Age: " + person.getAge());
// Display information using displayInfo method
person.displayInfo();
}
}
// OUTPUT:
// Person's Name: Pankaj
// Person's Age: 100
// Name: Pankaj
// Age: 100`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `Generally, variables of a class are declared as "private" whereas, methods of class are declared as "public". <br>
This means that variables cannot be accessed from outside the class but methods can be accessed from anywhere outside the class.<br>
• To use variables from outside, we will have to take the help of methods. <br>
• Thus, encapsulation protects data of a class from members of another class.<br><br>
<div class="bg-secondary border border-primary p-2">
<h4>Real Time Example:</h4>
Suppose you have an account in the bank. If your balance variable is declared as a public variable in
the bank software, your account balance will be known as public, In this case, anyone can know your
account balance. So, is it correct approach? Answer => is No.<br>
So, they declare balance variable as private for making your account safe, so that anyone cannot see
your account balance.<br>
The person who has to see his account balance, will have to access only private members through public
methods defined inside that class.
</div>

Thus, we can achieve security by utilizing the concept of data hiding. This is called Encapsulation in Java.<br>

Why ? <br>
<h4>Employee e1= new Employee();<br>
e1.salary= 5000; // case 1<br>
Employee e2= new Employee();<br>
e2.salary= -3000; // case 2</h4><br>

In this example, case 1, we are passing the 5000 salary to the employee that is correct but in case 2 we are passing a salary of -3000, which is negative.<br>
So salary cannot be negative.<br>
<br>

Below is one small, runnable code + output (proof) for the valid case and the rejected case: <br>`
                            },

                            {
                                content: `<h4>The Employee class (encapsulated salary field)</h4>`,
                                codeExamples: [
                                    `//How we are going to achieve this by using Encapsulation:
public class Employee { // Main Class: Employee
private int salary;
public void setSalary(int sal) {
if (sal > 0) { // 5000>0 True -3000>0 False = Salary =0
salary = sal; // 5000
} else {
salary = 0;
}
}
public int getSalary() {
return salary;
}
}`
                                ]
                            },

                            {
                                content: `<h4>Case 1 — Proof: a valid, positive salary is accepted</h4>`,
                                codeExamples: [
                                    `package com.encapsulation;
public class EncapsulationTest {
public static void main(String[] args) {
Employee e1 = new Employee();
e1.setSalary(5000); // valid, positive salary
System.out.println("salary>>" + e1.getSalary());
}
}
// OUTPUT:
// salary>>5000`
                                ]
                            },

                            {
                                content: `<h4>Case 2 — Proof: a negative salary is rejected by the setter</h4>
The setter's validation (<code>if (sal > 0)</code>) silently defaults invalid input to 0 instead of
storing the negative value - this is the "why" of encapsulation in action.`,
                                codeExamples: [
                                    `package com.encapsulation;
public class EncapsulationTest {
public static void main(String[] args) {
Employee e2 = new Employee();
e2.setSalary(-3000); // invalid, negative salary - rejected
System.out.println("salary>>" + e2.getSalary());
}
}
// OUTPUT:
// salary>>0`
                                ]
                            },

                            {
                                content: `<h4>Note-</h4> Always keeps global variables private & allows others to assign values through public
methods. Below is a more complete example with 3 encapsulated fields (id, name, city) taking dynamic
values from user input.`,
                                codeExamples: [`Program for Encapsulation Using Dynamic values
package com.encapsulation;
public class Employee { // Main Class: Employee
//------------------------------------------------------
// Private Variables
private int employeeId;
private String employeeName;
private String employeeCity;
//------------------------------------------------------
// Generate Getter and Setter Method (Public Methods)
public int getEmployeeId() {
return employeeId;
}
public void setEmployeeId(int employeeId) {
this.employeeId = employeeId;
}
public String getEmployeeName() {
return employeeName;
}
public void setEmployeeName(String employeeName) {
this.employeeName = employeeName;
}
public String getEmployeeCity() {
return employeeCity;
}
public void setEmployeeCity(String employeeCity) {
this.employeeCity = employeeCity;
}
//------------------------------------------------------
}`, `package com.encapsulation;
import java.util.Scanner;
public class TestMain { // Main Class: TestMain
public static void getUserInput() { // Method getUserInput
Scanner scanner = new Scanner(System.in);
System.out.println("Enter the ID>>");
int id = scanner.nextInt();
System.out.println("Enter the Name>>");
String name = scanner.next();
System.out.println("Enter the City");
String city = scanner.next();
// Set Data
Employee employee = new Employee(); // Object Creation
employee.setEmployeeId(id);
employee.setEmployeeName(name);
employee.setEmployeeCity(city);
// Get Data
System.out.println("Employee Id>>" + employee.getEmployeeId());
System.out.println("Employee Name>>" + employee.getEmployeeName());
System.out.println("Employee City>>" + employee.getEmployeeCity());
}
public static void main(String[] args) {
getUserInput(); // static = Call Data Using getUserInput Method
}
}`]
                            },
                            {
                                content: `Through encapsulation, data is hidden and protected from access by outside non-member methods
of a class. <br>Only member methods defined in a class will have access to the data.<br>
A Java class is an example of encapsulation because class binds variables and methods together.<br>
Generally, variables of a class are declared as "private" whereas, methods of class are declared as
"public". <br>This means that variables cannot be accessed from outside the class but methods can be
accessed from anywhere outside the class.<br>
To use variables from outside, we will have to take the help of methods. Thus, encapsulation protects
data of a class from members of another class.<br>
<div class="bg-secondary border border-primary p-2">
<h4>Benefits of Encapsulation:</h4>
1. Control: Allows you to control how data is accessed and modified.<br>
2. Data Hiding: Protects the internal state of the object from outside access and misuse.<br>
3. Flexibility: Enables changes to the internal implementation without affecting external code.<br>
4. Maintainability: Simplifies code management and maintenance.<br>
5. Security: Enhances the security of data by restricting access to it.<br>
</div>
<br>
<div class="bg-secondary border border-primary p-2">
<h4>Disadvantages of Encapsulation (In Short):</h4>
1. Increased Complexity: Requires additional getter and setter methods.<br>
2. Performance Overhead: Extra method calls can slightly impact performance.<br>
3. Restricted Flexibility: Can make data access and modification harder.<br>
4. Testing Challenges: Private methods are harder to test directly.<br>
5. Verbose Code: More lines of code due to getter and setter methods can reduce readability.<br>
</div><br>

<div class="bg-secondary border border-primary p-2">
<h4>1. What is encapsulation in Java?</h4>
o Encapsulation is the process of wrapping data (variables) and code (methods) together into a single
unit, typically a class. It is also known as data hiding because it restricts direct access to some of the
object's components.<br>
<h4>2. How do you achieve encapsulation in Java?</h4>
o Encapsulation is achieved by:<br>
 Declaring the variables of a class as private.<br>
 Providing public getter and setter methods to modify and view the variable values.<br>
<h4>3. What are the benefits of encapsulation?</h4>
o Encapsulation helps in:<br>
 Protecting the internal state of an object from unintended or harmful changes.<br>
 Improving modularity by keeping the data and methods that operate on the data together.<br>
 Enhancing maintainability and flexibility of the code.<br>
<h4>4. What is the difference between encapsulation and abstraction?</h4>
o Encapsulation is about bundling the data and methods that operate on the data within a single unit
and restricting access to some of the object's components. Abstraction, on the other hand, is about
hiding the complex implementation details and showing only the essential features of the object.<br>
<h4>5. Can you give an example of encapsulation in Java?</h4>
o Sure! Here's a simple example:<br>
Java
public class Person {<br>
private String name;<br>
private int age;<br>
public String getName() {<br>
return name;<br>
}<br>

public void setName(String name) {<br>
this.name = name;<br>
}<br>
In this example, the name and age variables are encapsulated within the Person class, and access to them
is controlled through getter and setter methods.<br>
<h4>6. What is a tightly encapsulated class?</h4>
o A tightly encapsulated class is one where all the instance variables are declared as private and
accessed only through public getter and setter methods.<br>
<h4>7. How does encapsulation improve code maintainability?</h4>
o Encapsulation improves maintainability by allowing changes to the internal implementation of a
class without affecting other parts of the code that use the class. This makes it easier to update and
manage the code.<br>
<h4>8. What is the role of getter and setter methods in encapsulation?</h4>
o Getter and setter methods provide controlled access to the private variables of a class. They allow
you to read and modify the values of the variables while maintaining control over how the variables
are accessed and updated.<br>
<h4>9. Can encapsulation be violated using reflection?</h4>
o Yes, encapsulation can be violated using Java Reflection API, which allows you to access private
fields and methods of a class. However, this should be avoided as it breaks the principles of
encapsulation and can lead to code that is difficult to maintain and debug.</h4>
<h4>10.Which design pattern is based on encapsulation in Java?</h4>
o The Singleton design pattern is based on encapsulation. It ensures that a class has only one instance
and provides a global point of access to it, encapsulating the instance creation logic.</h4>
</div>
`
                            }
                        ]
                    };
