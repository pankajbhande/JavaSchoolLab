import { Topic } from '../coreJava';

export const accessSpecifiers: Topic = {
                        id: 'access specifiers',
                        name: 'Access Specifiers',
                        beginner: [
                            {
                                content: `<p>Access specifiers decide who can use a variable, method, class and so on. In other words, they restrict access.</p>
<p>There are 4 types of access specifiers:</p>
<ul>
<li>Default</li>
<li>Public</li>
<li>Private</li>
<li>Protected</li>
</ul>

<h3>1. Default </h3>
<ul>
<li>It applies to Global Variable (GV), Constructors (C), Methods (M), Inner Class (IC) and Outer Class (OC). A local variable (LV) has no access level at all.</li>
<li>It is accessible within the same package only.</li>
<li>When no access specifier is written, the member is treated as default.</li>
<li>There is no keyword for it: do not write the word default (as you write private).</li>
<li>It provides more accessibility than private. But, it is more restrictive than protected, and public.</li>
</ul>

<p>Below is one small, runnable code + output for every place default access can be applied:</p>`
                            },

                            {
                                content: `<h4>Default Applied to Outer Class (OC):</h4>`,
                                codeExamples: [`package p1;

class DefaultOuterClass { // Default access - no modifier before "class"
    public static void main(String[] args) {
        System.out.println("DefaultOuterClass has default (package-private) access");
    }
}
// OUTPUT:
// DefaultOuterClass has default (package-private) access`]
                            },

                            {
                                content: `<h4>Default Applied to Global Variable (GV):</h4>
( Global Variable: Inside Class but Outside Main Method )`,
                                codeExamples: [`package p1;

class DefaultFieldDemo {
    int a = 10; // Default access - no modifier before "int"

    public static void main(String[] args) {
        DefaultFieldDemo obj = new DefaultFieldDemo();
        System.out.println("Default Global Variable a = " + obj.a);
    }
}
// OUTPUT:
// Default Global Variable a = 10`]
                            },

                            {
                                content: `<h4>Default Applied to Local Variable (LV):</h4>
<p>( Local Variable: inside a method. It has no access level, so no modifier can be written here )</p>`,
                                codeExamples: [`package p1;

class DefaultLocalVarDemo {
    public static void main(String[] args) {
        int b = 20; // Local variable - no access modifier allowed
        System.out.println("Local Variable b = " + b);
    }
}
// OUTPUT:
// Local Variable b = 20`]
                            },

                            {
                                content: `<h4>Default Applied to Constructor (C):</h4>`,
                                codeExamples: [`package p1;

class DefaultConstructorDemo {
    DefaultConstructorDemo() { // Default access constructor - no modifier
        System.out.println("Default Access Specifier applied to Constructor");
    }

    public static void main(String[] args) {
        new DefaultConstructorDemo(); // Constructor runs when object is created
    }
}
// OUTPUT:
// Default Access Specifier applied to Constructor`]
                            },

                            {
                                content: `<h4>Default Applied to Method (M):</h4>`,
                                codeExamples: [`package p1;

class DefaultMethodDemo {
    void x1() { // Default access - no modifier before "void"
        System.out.println("Display method invoked");
    }

    public static void main(String[] args) {
        DefaultMethodDemo obj = new DefaultMethodDemo();
        obj.x1();
    }
}
// OUTPUT:
// Display method invoked`]
                            },

                            {
                                content: `<h4>Default Applied to Inner Class (IC):</h4>`,
                                codeExamples: [`package p1;

class DefaultInnerClassDemo {
    class Inner { // Default access inner class - no modifier
        void show() {
            System.out.println("Inner class with default access");
        }
    }

    public static void main(String[] args) {
        DefaultInnerClassDemo outer = new DefaultInnerClassDemo();
        DefaultInnerClassDemo.Inner inner = outer.new Inner();
        inner.show();
    }
}
// OUTPUT:
// Inner class with default access`]
                            },

                            {
                                content: `<h4>Proof: Default cannot be accessed from a different package</h4>
<p>In the code below, calling a default method of a class in a different package fails at compile time.</p>`,
                                codeExamples: [`package com.p1;
public class DefaultAccessComponent {
void display() {
 System.out.println("Display method invoked");
 }
}
----------------------------------------------
package com.p2;              // DIFFERENT package - this is what makes it a proof
import com.p1.DefaultAccessComponent;
public class CrossPackageAttempt {
public static void main(String args[]) {
 DefaultAccessComponent obj = new DefaultAccessComponent();
 obj.display();              // COMPILE ERROR: display() is not public
 }
}
// OUTPUT:
// error: display() is not public in DefaultAccessComponent; cannot be accessed from outside package`]
                            },

                            {
                                content: `<h3>2. Public </h3>
<ul>
<li>It applies to Global Variable, Constructor, Method, Static Variable, Inner Class and Outer Class.</li>
<li>It can be accessed anywhere: inside the class, outside the class, in the same package or in a different package.</li>
<li>Local variables cannot be public because their scope is only the method. Writing public there gives a compile error (illegal start of expression).</li>
<li>The public access modifier has the widest/largest scope among all other access modifiers.</li>
</ul>`,
                                codeExamples: [
                                    `// ---- package p1 ----
package p1;

public class Greeter {
    public void display() { // public method - visible everywhere
        System.out.println("Display method invoked");
    }
}`,
                                    `// ---- package p2 ----
package p2;

import p1.*;

class GreeterUser {
    public static void main(String args[]) {
        Greeter greeter = new Greeter(); // create object
        greeter.display(); // ObjName.Method - callable from a different package
    }
}
// OUTPUT:
// Display method invoked`
                                ]
                            },

                            {
                                content: `<h4>Important Points:</h4>
<ul>
<li>If other programmers use your class, try to use the most restrictive access level that makes sense for a particular member. Use private unless you have a good reason not to.</li>
<li>Avoid public fields except for constants.</li>
</ul>

<p>Why do we use access specifiers?</p>
<p>Suppose the business rule says the employee CRUD operations must be called only through getEmployeeData().</p>

<h4>Scenario ( Using Public Access Specifier ) </h4>`,
                                codeExamples: [`package com.test;
public class Employee {
public void addOperation() {
 System.out.println("Add operation");
 }
public void editOperation() {
 System.out.println("Edit operation");
 }
public void getOperation() {
 System.out.println("Get operation");
 }
public void deleteOperation() {
 System.out.println("Delete operation");
 }
public void getEmployeeData() {
 addOperation(); // calling the methods
 editOperation();
 getOperation();
 deleteOperation();
 }
}
 -------------------------------------------
package com.test;
public class Test {
 public static void main(String[] args) {
 // Create 2 object
 Employee employee = new Employee();
 Employee employee2 = new Employee();
 employee.getEmployeeData();
 }
}
----------------------------------------------
OUTPUT:
Add operation
Edit operation
Get operation
Delete operation

`]
                            },

                            {
                                content: `<p>Here any outside class can call every method directly because they are public. So the requirement is not fulfilled.</p>`
                            },

                            {
                                content: `<h3>3. Private </h3>
<ul>
<li>It applies to Global Variable (GV), Method (M), Constructor (C) and Inner Class (IC) only.</li>
<li>An outer (top-level) class cannot be private.</li>
<li>Local variables cannot be private.</li>
</ul>

<p>Below is one small, runnable code + output (proof) for every place private access can be applied:</p>`
                            },

                            {
                                content: `<h4>Private Access Specifier Applied to Global Variable (GV):</h4>
( Global Variable: Inside Class but Outside Main Method )`,
                                codeExamples: [`public class PrivateFieldDemo {
    private int a = 10; // Private Global Variable

    void show() {
        System.out.println("Private Global Variable a = " + a);
    }

    public static void main(String[] args) {
        new PrivateFieldDemo().show();
    }
}
// OUTPUT:
// Private Global Variable a = 10`]
                            },

                            {
                                content: `<h4>Private Access Specifier Applied to Method (M):</h4>`,
                                codeExamples: [`public class PrivateMethodDemo {
    private void x1() { // Private Method
        System.out.println("Display method invoked");
    }

    public static void main(String[] args) {
        PrivateMethodDemo obj = new PrivateMethodDemo();
        obj.x1(); // OK - called from within the same class
    }
}
// OUTPUT:
// Display method invoked`]
                            },

                            {
                                content: `<h4>Private Access Specifier Applied to Constructor (C):</h4>`,
                                codeExamples: [`public class PrivateConstructorDemo {
    private PrivateConstructorDemo() { // Private Constructor
        System.out.println("Private Constructor");
    }

    public static void main(String[] args) {
        new PrivateConstructorDemo(); // OK - called from within the same class
    }
}
// OUTPUT:
// Private Constructor`]
                            },

                            {
                                content: `<h4>Private Access Specifier Applied to Inner Class (IC):</h4>`,
                                codeExamples: [`public class PrivateInnerClassDemo {
    private class Inner { // Private Inner Class
        void show() {
            System.out.println("Private Inner Class Demo");
        }
    }

    public static void main(String[] args) {
        PrivateInnerClassDemo outer = new PrivateInnerClassDemo();
        PrivateInnerClassDemo.Inner inner = outer.new Inner();
        inner.show();
    }
}
// OUTPUT:
// Private Inner Class Demo`]
                            },

                            {
                                content: `<h4>Proof: private cannot be applied to Outer Class / Local Variable</h4>`,
                                codeExamples: [`private class NotAllowedOuterClass { }
// COMPILE ERROR: modifier private not allowed here
// (Outer class cannot be private)

public class IllegalLocalVarDemo {
    public static void main(String[] args) {
        private int b = 20;
        // COMPILE ERROR: illegal start of expression
        // (Local variable cannot be private)
    }
}`]
                            },

                            {
                                content: `
<ul>
<li>It can be accessed within the class only, not from another class or another package.</li>
</ul>`,
                                codeExamples: [
                                    `package com.test;
// Class: 01st
public class PrivateFieldHolder {
    private void x1() { // Method: x1, private
        System.out.println("This is x1 Method");
    }
    private int a = 20; // private Variable
}`,
                                    `package com.test;
// Class 02nd - a DIFFERENT class trying to reach the private members above
public class PrivateAccessAttempt {
    public static void main(String[] args) {
        PrivateFieldHolder holder = new PrivateFieldHolder();
        // holder.x1();          // COMPILE ERROR: x1() has private access
        // System.out.println(holder.a);   // COMPILE ERROR: a has private access
    }
}
// x1() and a are both private, so PrivateAccessAttempt cannot reach them -
// only PrivateFieldHolder itself can call x1() or read a.`
                                ]
                            },

                            {
                                content: `<h4>Proof: private is not even visible across packages</h4>`,
                                codeExamples: [
                                    `// ---- package com.p1 ----
package com.p1;
public class SecureComponent {
    private void display() {
        System.out.println("Display method invoked");
    }
}`,
                                    `// ---- package com.p2 ----
package com.p2;
import com.p1.SecureComponent;
public class AccessAttempt {
    public static void main(String args[]) {
        SecureComponent obj = new SecureComponent();
        // Trying to access private method of another class
        obj.display(); // object.Method_Name
    }
}
// OUTPUT:
// error: display() has private access in SecureComponent
//  obj.display();`
                                ]
                            },

                            {
                                content: `<p>Top-level classes or interfaces cannot be private or protected because:</p>
<ul>
<li>private means "only visible within the enclosing class".</li>
<li>protected means "only visible within the enclosing class and any subclasses".</li>
<li>A top-level class has no enclosing class, so neither makes sense.</li>
</ul>

<h4>Scenario ( Using private Access Specifier )</h4>`,
                                codeExamples: [`package com.javaschoollab.demo;
public class Employee {
private void addOperation() {
 System.out.println("Add operation");
 }
private void editOperation() {
 System.out.println("Edit operation");
 }
private void getOperation() {
 System.out.println("Get operation");
 }
private void deleteOperation() {
 System.out.println("Delete operation");
 }
public void getEmployeeData() {
 addOperation();
 editOperation();
 getOperation();
 deleteOperation();
 }
}
---------------------------------------
package com.test;
public class Test {
public static void main(String[] args) {
 Employee employee = new Employee();
 Employee employee2 = new Employee();
 employee.getEmployeeData();
 }
}
---------------------------------------
OUTPUT:
Add operation
Edit operation
Get operation
Delete operation
`]
                            },
                            {
                                content: `<ul>
<li>Here we cannot directly call any method except getEmployeeData(), because the others are private.</li>
<li>Outside code must go through getEmployeeData().</li>
<li>addOperation(), editOperation(), getOperation() and deleteOperation() are not accessible from outside because they are private, not public.</li>
</ul>`
                            },

                            {
                                content: `<h3>4. Protected </h3>
<ul>
<li>It applies to Global Variables (GV), Constructor (C), Methods (M) and Inner Class.</li>
<li>It cannot be applied to Local Variables or an Outer Class.</li>
</ul>

<p>Below is one small, runnable code + output (proof) for every place protected access can be applied:</p>`
                            },

                            {
                                content: `<h4>Protected Access Specifier Applied to Global Variable (GV):</h4>
( Global Variable: Inside Class but Outside Main Method )`,
                                codeExamples: [`public class ProtectedFieldDemo {
    protected int a = 10; // Protected Global Variable

    void show() {
        System.out.println("Protected Global Variable a = " + a);
    }

    public static void main(String[] args) {
        new ProtectedFieldDemo().show();
    }
}
// OUTPUT:
// Protected Global Variable a = 10`]
                            },

                            {
                                content: `<h4>Protected Access Specifier Applied to Method (M):</h4>`,
                                codeExamples: [`public class ProtectedMethodDemo {
    protected void x1() { // Protected Method
        System.out.println("Display method invoked");
    }

    public static void main(String[] args) {
        new ProtectedMethodDemo().x1();
    }
}
// OUTPUT:
// Display method invoked`]
                            },

                            {
                                content: `<h4>Protected Access Specifier Applied to Constructor (C):</h4>`,
                                codeExamples: [`public class ProtectedConstructorDemo {
    protected ProtectedConstructorDemo() { // Protected Constructor
        System.out.println("Protected Constructor");
    }

    public static void main(String[] args) {
        new ProtectedConstructorDemo();
    }
}
// OUTPUT:
// Protected Constructor`]
                            },

                            {
                                content: `<h4>Protected Access Specifier Applied to Inner Class (IC):</h4>`,
                                codeExamples: [`public class ProtectedInnerClassDemo {
    protected class Inner { // Protected Inner Class
        void show() {
            System.out.println("Protected Inner Class Demo");
        }
    }

    public static void main(String[] args) {
        ProtectedInnerClassDemo outer = new ProtectedInnerClassDemo();
        ProtectedInnerClassDemo.Inner inner = outer.new Inner();
        inner.show();
    }
}
// OUTPUT:
// Protected Inner Class Demo`]
                            },

                            {
                                content: `<h4>Proof: protected cannot be applied to Outer Class / Local Variable</h4>`,
                                codeExamples: [`protected class NotAllowedOuterClass { }
// COMPILE ERROR: modifier protected not allowed here
// (Outer class cannot be protected)

public class IllegalLocalVarDemo {
    public static void main(String[] args) {
        protected int b = 20;
        // COMPILE ERROR: illegal start of expression
        // (Local variable cannot be protected)
    }
}`]
                            },

                            {
                                content: `<h4>Proof: protected is accessible in a subclass from a different package</h4>
<p>It is accessible within the same package, and also in another package through inheritance (calling it on "this" or a subclass reference).</p>
<p>In this example we create 2 packages, p1 and p2. Class Base in p1 is public, so it can be imported into p2. The method display() in Base is protected. Class Derived (in p2) extends Base and calls the inherited method through its own object.</p>`,
                                codeExamples: [
                                    `// ---- package p1 ----
package p1;

public class Base {
    protected void display() {
        System.out.println("Display method invoked");
    }
}`,
                                    `// ---- package p2 ----
package p2;

import p1.Base;

public class Derived extends Base {
    public static void main(String[] args) {
        Derived obj = new Derived();
        obj.display(); // inherited protected method, called via subclass
    }
}
// OUTPUT:
// Display method invoked`
                                ]
                            },
                            {
                                content: `<h3>1. Definition</h3>
<ul>
<li>An <b>access specifier</b> is a keyword that decides who is allowed to see and use a class, a field, a method or a constructor.</li>
<li>Java has four levels. <b>private</b> is visible only inside the same class. <b>default</b>, written by using no keyword at all, is visible inside the same package. <b>protected</b> is visible inside the package and to child classes anywhere. <b>public</b> is visible everywhere.</li>
<li>Access specifiers are checked by the <b>compiler</b>, so a wrong access is an error before the program even runs.</li>
<li>They are also called <b>access modifiers</b>, and they are the tool that turns a plain class into a properly encapsulated one.</li>
</ul>

<h3>2. Purpose of This Topic</h3>
<ul>
<li>To <b>hide internal details</b> so that other code cannot break your object by touching fields directly.</li>
<li>To <b>publish a small, stable API</b> and keep everything else free to change.</li>
<li>To <b>protect data</b>, for example a bank balance that must only change through deposit and withdraw.</li>
<li>To make a class safe for <b>inheritance</b> by choosing protected only where a child truly needs it.</li>
</ul>

<h3>3. Need of This Topic</h3>
<ul>
<li>Without private fields, any class in the project could set a balance to a negative number.</li>
<li>Large teams need clear boundaries. public says stay, private says this may change tomorrow.</li>
<li>Frameworks like Spring and Hibernate rely on correct access for proxies and reflection.</li>
<li>Every interview on encapsulation begins with the four access levels and their exact table.</li>
</ul>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3: the four access levels in one bank account class

public class AccessBasicsDemo {

    static class SavingsAccount {

        private long balancePaise;          // POINT 1: private, only this class
        String accountHolder;               // POINT 1: default, same package only
        protected String branchCode;        // POINT 1: package plus subclasses
        public String accountNumber;        // POINT 1: everyone

        public SavingsAccount(String accountNumber, String holder) {
            this.accountNumber = accountNumber;
            this.accountHolder = holder;
            this.branchCode = "SBIN0001234";
            this.balancePaise = 0;
        }

        // POINT 2: the only doors into the private data
        public void deposit(long paise) {
            if (paise <= 0) {
                System.out.println("Deposit must be positive");
                return;
            }
            balancePaise += paise;
        }

        public boolean withdraw(long paise) {
            if (paise <= 0 || paise > balancePaise) {
                System.out.println("Withdraw rejected for Rs " + (paise / 100));
                return false;
            }
            balancePaise -= paise;
            return true;
        }

        public long getBalancePaise() {
            return balancePaise;
        }

        // POINT 3: helper nobody outside needs to see
        private void auditLog(String message) {
            System.out.println("[AUDIT] " + accountNumber + " " + message);
        }

        public void monthEnd() {
            auditLog("statement generated");
        }
    }

    public static void main(String[] args) {

        SavingsAccount acc = new SavingsAccount("SB100234", "Meera Nair");

        // WRONG: this would let anyone set any balance
        // acc.balancePaise = 99999999;   // compile error, balancePaise has private access
        // acc.auditLog("hack");          // compile error, auditLog has private access

        // RIGHT: go through the public methods
        acc.deposit(2500000);             // Rs 25000
        acc.withdraw(500000);             // Rs 5000
        acc.withdraw(9900000);            // rejected

        System.out.println("Holder  : " + acc.accountHolder);
        System.out.println("Branch  : " + acc.branchCode);
        System.out.println("Number  : " + acc.accountNumber);
        System.out.println("Balance : Rs " + (acc.getBalancePaise() / 100));
        acc.monthEnd();
    }
}
// OUTPUT:
// Withdraw rejected for Rs 99000
// Holder  : Meera Nair
// Branch  : SBIN0001234
// Number  : SB100234
// Balance : Rs 20000
// [AUDIT] SB100234 statement generated`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages</h3>
<ul>
<li><b>Data safety.</b> private stops any outside code from putting an object into an invalid state.</li>
<li><b>Freedom to change.</b> Anything private can be renamed or deleted without breaking other classes.</li>
<li><b>Clear contract.</b> A reader of your class instantly knows what is meant for use and what is internal.</li>
<li><b>Validation in one place.</b> All rules sit inside the setter or the business method.</li>
<li><b>Safer inheritance.</b> protected lets a child extend behaviour without opening the class to the whole world.</li>
</ul>

<h3>5. Disadvantages</h3>
<ul>
<li><b>More code.</b> Every private field usually needs a getter, which feels like boilerplate.</li>
<li><b>Over use of public</b> is very common and silently destroys encapsulation.</li>
<li><b>protected is leaky.</b> It also exposes the member to every class in the same package, which surprises people.</li>
<li><b>Getters can still leak.</b> Returning a mutable list or array lets a caller change internal state anyway.</li>
<li><b>Reflection can bypass private</b> when the module system allows it, so access control is not security.</li>
</ul>`,
                                codeExamples: [
                                    `// Points 4 and 5: a getter that leaks, and the defensive copy that fixes it

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class AccessPitfallDemo {

    static class StudentRecord {

        private final String name;
        private final List<Integer> marks = new ArrayList<>();

        StudentRecord(String name) {
            this.name = name;
        }

        public void addMarks(int m) {
            if (m < 0 || m > 100) {
                System.out.println("Invalid marks rejected: " + m);
                return;   // ADVANTAGE 4: validation in one place
            }
            marks.add(m);
        }

        // DISADVANTAGE 5: WRONG getter, hands over the real list
        public List<Integer> getMarksLeaky() {
            return marks;
        }

        // RIGHT getter, gives an unmodifiable view
        public List<Integer> getMarksSafe() {
            return Collections.unmodifiableList(new ArrayList<>(marks));
        }

        public String getName() {
            return name;
        }
    }

    public static void main(String[] args) {

        StudentRecord s = new StudentRecord("Karthik Iyer");
        s.addMarks(88);
        s.addMarks(76);
        s.addMarks(150);          // rejected by validation

        // WRONG: caller edits internal state through the leaky getter
        s.getMarksLeaky().add(999);
        System.out.println("After leak  : " + s.getMarksSafe());

        // RIGHT: the safe getter refuses the change
        try {
            s.getMarksSafe().add(1000);
        } catch (UnsupportedOperationException e) {
            System.out.println("Safe getter blocked the outside change");
        }

        System.out.println("Student " + s.getName() + " marks " + s.getMarksSafe());
    }
}
// OUTPUT:
// Invalid marks rejected: 150
// After leak  : [88, 76, 999]
// Safe getter blocked the outside change
// Student Karthik Iyer marks [88, 76, 999]`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples</h3>
<ul>
<li><b>Bank account:</b> balance is private, deposit and withdraw are public, the audit writer is private.</li>
<li><b>College portal:</b> a student cannot set their own marks, only a public method used by the faculty module can.</li>
<li><b>Paytm wallet:</b> the wallet id is public for display, the encryption key field is private and never has a getter.</li>
<li><b>Aadhaar service:</b> only the last four digits are exposed through a public method, the full number stays private.</li>
<li><b>Global example, java.lang.String:</b> the internal byte array is private and final, which is why String is immutable.</li>
<li><b>Spring service:</b> the repository field is private, injected by the framework, and never touched by a controller.</li>
</ul>

<b>Quick table for revision:</b> private is same class only, default is same package, protected is same package plus child classes anywhere, public is everywhere. A top level class can only be public or default, never private or protected.`,
                                codeExamples: [
                                    `// Point 6: a Paytm style wallet showing what is public and what stays hidden

public class WalletAccessDemo {

    static class Wallet {

        public final String walletId;          // safe to show on screen
        private long balancePaise;             // never exposed directly
        private final String secretPin;        // no getter at all, ever
        protected String kycLevel;             // subclasses may read it

        public Wallet(String walletId, String secretPin) {
            this.walletId = walletId;
            this.secretPin = secretPin;
            this.kycLevel = "MINIMUM";
            this.balancePaise = 0;
        }

        public void topUp(long paise) {
            balancePaise += paise;
        }

        // RIGHT: pay only after checking the pin, the pin never leaves the class
        public boolean pay(String pin, long paise, String merchant) {
            if (!secretPin.equals(pin)) {
                System.out.println("Wrong PIN for " + walletId);
                return false;
            }
            if (paise > balancePaise) {
                System.out.println("Insufficient balance for " + merchant);
                return false;
            }
            balancePaise -= paise;
            System.out.println("Paid Rs " + (paise / 100) + " to " + merchant);
            return true;
        }

        public String getMaskedBalance() {
            return "Rs " + (balancePaise / 100);
        }
    }

    static class MerchantWallet extends Wallet {
        MerchantWallet(String id, String pin) {
            super(id, pin);
            this.kycLevel = "FULL";        // protected, visible to the child
        }
        public String describe() {
            // return secretPin;           // WRONG: private, not visible even to a child
            return walletId + " KYC " + kycLevel;
        }
    }

    public static void main(String[] args) {

        Wallet w = new Wallet("PT9988776655", "4321");
        w.topUp(500000);                    // Rs 5000

        w.pay("1111", 20000, "Swiggy");     // wrong pin
        w.pay("4321", 20000, "Swiggy");     // Rs 200
        w.pay("4321", 90000000, "Amazon");  // not enough

        System.out.println("Wallet " + w.walletId + " balance " + w.getMaskedBalance());

        MerchantWallet m = new MerchantWallet("PTM0001", "9999");
        System.out.println(m.describe());
    }
}
// OUTPUT:
// Wrong PIN for PT9988776655
// Paid Rs 200 to Swiggy
// Insufficient balance for Amazon
// Wallet PT9988776655 balance Rs 4800
// PTM0001 KYC FULL`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `<p>A local variable cannot have any access specifier. Only <code>final</code> can be applied to it.</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th></th>
<th>private</th>
<th>default</th>
<th>protected</th>
<th>public</th>
</tr>

<tr class='text-center'>
<td>Same class</td>
<td>Yes</td>
<td>Yes</td>
<td>Yes</td>
<td>Yes</td>
</tr>

<tr class='text-center'>
<td>Same Package sub-class</td>
<td>No</td>
<td>Yes</td>
<td>Yes</td>
<td>Yes</td>
</tr>

<tr class='text-center'>
<td>Same Package non-subclass</td>
<td>No</td>
<td>Yes</td>
<td>Yes</td>
<td>Yes</td>
</tr>

<tr class='text-center'>
<td>Different package sub-class</td>
<td>No</td>
<td>No</td>
<td>Yes</td>
<td>Yes</td>
</tr>

<tr class='text-center'>
<td>Different package non-subclass </td>
<td>No</td>
<td>No</td>
<td>No</td>
<td>Yes</td>
</tr>
</table>
<h3>Algorithm to use access modifiers in Java</h3>
<p>Here is a basic algorithm for using access modifiers in Java:</p>
<h4>Define a class: </h4>
<ul>
<li>Create a class that represents the object you want to manage.</li>
</ul>

<h4>Define instance variables:</h4>
<p>Within the class, define instance variables that represent the data you want to manage.</p>

<h4>Specify an access modifier:</h4>
<ul>
<li>For each instance variable, specify an access modifier that determines the visibility of the variable.</li>
<li>The three main access modifiers in Java are private, protected, and public.</li>
</ul>

<h4>Use private for variables that should only be accessible within the class:</h4>
<ul>
<li>If you want to prevent access to a variable from outside the class, use the private access modifier.</li>
<li>This is the most restrictive access modifier and provides the greatest level of encapsulation.</li>
</ul>

<h4>Use protected for variables that should be accessible within the class and its subclasses: </h4>
<ul>
<li>If you want to allow access to a variable from within the class and its subclasses, use the protected access modifier.</li>
<li>This is less restrictive than private and supports inheritance.</li>
</ul>

<h4>Use public for variables that should be accessible from anywhere:</h4>
<ul>
<li>If you want to allow access to a variable from anywhere, use the public access modifier.</li>
<li>This is the least restrictive access modifier and provides the least amount of encapsulation.</li>
</ul>

<h4>Use accessor and mutator methods to manage access to the variables:</h4>
<ul>
<li>In order to access and modify the variables, use accessor (getter) and mutator (setter) methods, even if the variables have a public access modifier.</li>
<li>This provides a level of abstraction and makes your code more maintainable and testable.</li>
</ul>

<p>In this way, we use the access specifiers.</p>
<h4>1. What are access modifiers in Java? </h4>
<p>Access modifiers are keywords that control who can use a class, field, method or constructor.</p>

<h4>2. What is void in Java?</h4>
<p>void is the return type of a method that returns no value.</p>

<h4>3. What are the common modifiers in Java?</h4>
<p>Access modifiers: public, private, protected and default (no keyword). Non-access modifiers: final, static, abstract, synchronized, native, strictfp, transient and volatile.</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2">
<tr>
<th>Public Access Modifier</th>
<th>Private Access Modifier </th>
</tr>

<tr>
<td>This modifier is applicable for both top-level classes and interfaces.</td>
<td>This modifier is not applicable for both top-level classes and interfaces</td>
</tr>

<tr>
<td>Public members can be accessed from the child class of the same package.</td>
<td>Private members cannot be accessed from the child class of the same package.</td>
</tr>

<tr>
<td>Public member can be accessed from non-child class of same package.</td>
<td>Private members cannot be accessed from non-child class of same package.
</td>
</tr>

<tr>
<td>Public members can be accessed from child class of outside package.</td>
<td>Private members cannot be accessed from child class of outside package.</td>
</tr>

<tr>
<td>Public members can be accessed from non-child class of outside package</td>
<td>Private members cannot be accessed from non-child class of outside package.</td>
</tr>

<tr>
<td>Public modifier is the most accessible modifier.</td>
<td>Private modifier is the most restricted modifier.</td>
</tr>

</table>`
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>The Complete Accessibility Matrix</h3>
Java has exactly 4 access levels. This is the single most important table to memorize for interviews - it covers every possible calling context:<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Calling Context</th>
<th>private</th>
<th>default</th>
<th>protected</th>
<th>public</th>
</tr>
<tr class='text-center'><td>Same class</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
<tr class='text-center'><td>Same package (non-subclass)</td><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
<tr class='text-center'><td>Same package (subclass)</td><td>No</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
<tr class='text-center'><td>Different package (subclass)</td><td>No</td><td>No</td><td>Yes*</td><td>Yes</td></tr>
<tr class='text-center'><td>Different package (unrelated class)</td><td>No</td><td>No</td><td>No</td><td>Yes</td></tr>
</table>
<p><strong>*</strong> The "Yes" for protected across packages comes with an important restriction covered below - it is NOT unconditional access.</p>`
                            },
                            {
                                content: `<h3>Class-Level vs Member-Level Access Rules</h3>
<p>Not every access level is legal everywhere - the rules differ for top-level classes vs class members:</p>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Top-level class or interface
    +-- public   -> allowed
    +-- default  -> allowed (package-private)
    +-- private  -> NOT allowed (compile error)
    +-- protected -> NOT allowed (compile error)

Class member (field, method, constructor, nested/inner class)
    +-- public    -> allowed
    +-- default   -> allowed
    +-- private   -> allowed
    +-- protected -> allowed</pre>
<p><strong>Why can't a top-level class be private or protected?</strong> A top-level class has no enclosing class, so neither modifier means anything there. Only a <strong>nested</strong> (inner) class can legally be private or protected.</p>`,
                                codeExamples: [
                                    `// AccessDemo.java
public class AccessDemo {

    // Nested class CAN be private or protected
    private class InnerHelper {
        void assist() {
            System.out.println("Inner helper assisting");
        }
    }

    public void run() {
        InnerHelper helper = new InnerHelper();
        helper.assist();
    }

    public static void main(String[] args) {
        new AccessDemo().run();
    }
}
// OUTPUT:
// Inner helper assisting`
                                ]
                            },
                            {
                                content: `<h3>The protected Nuance Every Interviewer Asks About</h3>
<p>protected members ARE accessible from a subclass in a different package - but <strong>only through the subclass's own inheritance chain</strong> (via <code>this</code> or a subclass-typed reference), NOT through a supertype reference to some unrelated instance of the base class.</p>`,
                                codeExamples: [
                                    `// ---- package p1 ----
package p1;

public class Animal {
    protected void makeSound() {
        System.out.println("Some generic animal sound");
    }
}`,
                                    `// ---- package p2 ----
package p2;

import p1.Animal;

public class Dog extends Animal {

    void barkLikeInherited() {
        // OK: accessed through inherited method on "this" (a Dog)
        makeSound();
    }

    void tryAccessOtherInstance() {
        Animal other = new Animal();
        // other.makeSound();
        // COMPILE ERROR: cannot access protected member of an
        // unrelated Animal instance from outside p1 - protected
        // only grants access through the subclass's own hierarchy.
        System.out.println("Cannot call other.makeSound() here - see comment");
    }

    public static void main(String[] args) {
        Dog d = new Dog();
        d.barkLikeInherited();
        d.tryAccessOtherInstance();
    }
}
// OUTPUT:
// Some generic animal sound
// Cannot call other.makeSound() here - see comment`
                                ]
                            },
                            {
                                content: `<h3>Encapsulation: private Fields + public Getters/Setters</h3>
<p>The most common real-world use of access modifiers: hide internal state behind a controlled public API so rules (invariants) can be enforced.</p>`,
                                codeExamples: [
                                    `public class BankAccount {
    private double balance;   // hidden - cannot be modified directly from outside

    public BankAccount(double initialBalance) {
        this.balance = initialBalance;
    }

    public double getBalance() {          // controlled read access
        return balance;
    }

    public void deposit(double amount) {  // controlled write access with validation
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit must be positive");
        }
        balance += amount;
    }

    public static void main(String[] args) {
        BankAccount acc = new BankAccount(1000);
        acc.deposit(500);
        // acc.balance = -99999;   // COMPILE ERROR: balance is private
        System.out.println("Balance: " + acc.getBalance());
    }
}
// OUTPUT:
// Balance: 1500.0`
                                ]
                            },
                            {
                                content: `<h3>Common Interview Traps</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why make a constructor private?</td><td>To implement Singleton / prevent instantiation from outside (factory methods control creation)</td></tr>
<tr class='text-center'><td>Can interface members be private?</td><td>Fields are implicitly public static final; abstract methods are implicitly public - only a private method (Java 9+, as an internal helper) is non-public</td></tr>
<tr class='text-center'><td>Why can't local variables/parameters have access modifiers?</td><td>Their scope is already limited to the method/block - an access modifier would be meaningless</td></tr>
<tr class='text-center'><td>Can a subclass narrow an overridden method's access?</td><td>No - overriding methods must have the same or wider access than the method they override</td></tr>
</table>`,
                                codeExamples: [
                                    `public class Singleton {
    private static final Singleton INSTANCE = new Singleton();

    private Singleton() {
        // private constructor blocks "new Singleton()" from outside
    }

    public static Singleton getInstance() {
        return INSTANCE;
    }

    public static void main(String[] args) {
        Singleton s1 = Singleton.getInstance();
        Singleton s2 = Singleton.getInstance();
        System.out.println(s1 == s2);
    }
}
// OUTPUT:
// true`
                                ]
                            },
                            {
                                content: `<h3>Access Modifiers vs Non-Access Modifiers</h3>
<p>Java modifiers split into two families that are easy to confuse in interviews:</p>

<ul>
<li><strong>Access modifiers</strong> (4 total) - control <em>visibility</em>: <code>private</code>, default (no keyword), <code>protected</code>, <code>public</code>.</li>
<li><strong>Non-access modifiers</strong> - control <em>behavior</em>, not visibility: <code>static</code>, <code>final</code>, <code>abstract</code>, <code>synchronized</code> (plus less common ones like <code>transient</code>, <code>volatile</code>, <code>native</code>, <code>strictfp</code>).</li>
</ul>

<p>A member can combine one access modifier with one or more non-access modifiers, e.g. <code>public static final int MAX = 100;</code></p>

<h4>final and abstract Can Never Combine</h4>
<p><code>final</code> means "cannot be overridden or extended". <code>abstract</code> means "MUST be overridden or extended". Using both on a class or method is a contradiction, so the compiler rejects it.</p>`,
                                codeExamples: [
                                    `public abstract final class Broken {
    // COMPILE ERROR: illegal combination of modifiers: abstract and final
}`,
                                    `public class ModifierRules {
    // abstract methods cannot be private - an abstract method
    // MUST be overridden by a subclass, but a private method
    // isn't even visible to a subclass, so the two are incompatible.
    // abstract private void broken();   // COMPILE ERROR

    public static void main(String[] args) {
        System.out.println("abstract methods must be public, protected, or default - never private or static");
    }
}
// OUTPUT:
// abstract methods must be public, protected, or default - never private or static`
                                ]
                            },
                            {
                                content: `<h3>Default Access Levels Inside an Interface</h3>
<p>Interface members have their own implicit defaults, different from a regular class:</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Interface member</th><th>Implicit modifiers</th></tr>
<tr class='text-center'><td>Fields</td><td>public static final (always a constant)</td></tr>
<tr class='text-center'><td>Abstract methods</td><td>public (no other access modifier allowed on them)</td></tr>
<tr class='text-center'><td>default / static methods (Java 8+)</td><td>public by default (private allowed since Java 9, for internal helper methods)</td></tr>
</table>
<p>Enum constants follow a similar fixed rule - they are always implicitly public, and no other access modifier can be applied to them.</p>`
                            },
                            {
                                content: `<h3>Quick Decision Guide — Which Modifier to Use</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Situation</th><th>Use</th></tr>
<tr class='text-center'><td>Internal implementation detail, no outside code should touch it</td><td>private</td></tr>
<tr class='text-center'><td>Helper classes/methods shared only within the same package</td><td>default (package-private)</td></tr>
<tr class='text-center'><td>Meant to be extended/overridden by subclasses, even in other packages</td><td>protected</td></tr>
<tr class='text-center'><td>Part of the stable public API of your library/module</td><td>public</td></tr>
</table>
<p><strong>Golden rule:</strong> start as restrictive as possible (private) and widen access only when a real caller genuinely needs it - never expose more than necessary.</p>`
                            },
                            {
                                content: `<h3>1. Definition (Advanced)</h3>
<ul>
<li>Access control in Java is <b>compile time enforcement plus JVM verification</b>. The access flags ACC_PUBLIC, ACC_PRIVATE and ACC_PROTECTED are written into the class file and the verifier checks them again at link time.</li>
<li><b>default access has no keyword and no flag.</b> The absence of the three flags means package private, and package identity includes the class loader, so two classes with the same package name loaded by different loaders are not package mates.</li>
<li><b>protected has two rules.</b> A subclass in another package may access a protected member only through a reference of its own type or a subtype, never through a plain parent reference.</li>
<li>Since Java 9 the <b>module system adds a second gate</b>. A public type in a package that is not exported is unreachable from another module, so public no longer means public to everyone.</li>
<li>Since Java 11 <b>nestmates</b> let nested classes access each other's private members directly, and the compiler no longer generates synthetic bridge accessors.</li>
</ul>

<h3>2. Purpose of This Topic (Advanced)</h3>
<ul>
<li>To design a <b>published API surface</b> that you can maintain for years without breaking callers.</li>
<li>To understand why frameworks demand <b>public no argument constructors</b> or at least accessible ones for proxying.</li>
<li>To reason about <b>CGLIB and Spring AOP</b>, which cannot proxy private or final methods, so a self invocation skips the advice.</li>
<li>To use <b>modules and sealed types</b> to make illegal states unrepresentable across module boundaries.</li>
</ul>

<h3>3. Need of This Topic (Advanced)</h3>
<ul>
<li>Production bugs happen when a transactional method is private and Spring silently applies no transaction.</li>
<li>Library authors who mark everything public can never remove anything without a major version bump.</li>
<li>Security reviews check that secrets and keys are private, final and never returned from a getter.</li>
<li>Interviewers love the protected across packages rule because almost nobody states it correctly.</li>
</ul>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3 at expert level: protected rules and nestmate private access

public class AdvancedAccessDemo {

    // POINT 1: nestmates. Outer and nested classes see each other's private members.
    private static String vaultKey = "AES-256-KEY";

    static class TokenIssuer {
        String issue(String user) {
            // RIGHT: legal since Java 11 nestmates, no synthetic accessor generated
            return user + ":" + vaultKey.hashCode();
        }
    }

    // POINT 1: the protected rule demonstrated with a base and a child
    static class BaseLedger {
        protected long openingBalancePaise = 100000L;

        protected void post(long paise) {
            openingBalancePaise += paise;
        }
    }

    static class BranchLedger extends BaseLedger {

        void demonstrateProtectedRule(BaseLedger otherParent, BranchLedger sibling) {

            // RIGHT: access through this, which is a BranchLedger
            this.post(5000L);
            System.out.println("Own balance: " + this.openingBalancePaise);

            // RIGHT: access through another BranchLedger reference
            sibling.post(2500L);
            System.out.println("Sibling balance: " + sibling.openingBalancePaise);

            // WRONG when BaseLedger sits in a different package:
            // otherParent.post(100L);
            // The compiler rejects it because the reference type is the parent,
            // not the current subclass. Here both classes share a file, so it
            // compiles, but in a real multi package project it would not.
            System.out.println("Parent reference access is package dependent");
        }
    }

    public static void main(String[] args) {

        System.out.println("Token: " + new TokenIssuer().issue("meera"));

        BranchLedger b = new BranchLedger();
        b.demonstrateProtectedRule(new BaseLedger(), new BranchLedger());
    }
}
// OUTPUT (hash value varies by JVM string hashing of the key):
// Token: meera:<hash>
// Own balance: 105000
// Sibling balance: 102500
// Parent reference access is package dependent`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages (Advanced)</h3>
<ul>
<li><b>Binary compatibility.</b> A small public surface means you can change internals in a patch release and callers keep working without recompiling.</li>
<li><b>JIT inlining.</b> private and final methods are not virtual dispatch candidates, so HotSpot inlines them aggressively.</li>
<li><b>Nestmates remove bridge methods,</b> which shrinks class files and removes a stack frame from hot inner class access.</li>
<li><b>Modules give strong encapsulation,</b> so deep reflection into non exported packages fails by default and platform internals stay safe.</li>
<li><b>Sealed interfaces plus package private implementations</b> let you switch exhaustively without exposing subclasses.</li>
</ul>

<h3>5. Disadvantages (Advanced)</h3>
<ul>
<li><b>protected is a permanent commitment.</b> Once shipped it is part of the API for every subclass author.</li>
<li><b>Reflection with setAccessible</b> can still read private state when the module opens the package, so access control is not a security boundary.</li>
<li><b>Serialization ignores access.</b> A private field is written into the byte stream and can be read by anyone holding the bytes.</li>
<li><b>Spring proxies fail silently</b> on private, final or self invoked methods, so Transactional and Cacheable annotations are ignored.</li>
<li><b>Package private testing is fragile,</b> because the test must live in the same package and a module or a shaded jar can break that.</li>
</ul>`,
                                codeExamples: [
                                    `// Points 4 and 5 at expert level: reflection defeats private, and the self invocation trap

import java.lang.reflect.Field;

public class AccessLimitsDemo {

    static class PaymentService {

        private String apiSecret = "sk_live_1234567890";

        // DISADVANTAGE 5: a private method can never be proxied by Spring AOP
        private void chargeInternal(long paise) {
            System.out.println("Charging Rs " + (paise / 100) + " with no transaction advice");
        }

        // WRONG in Spring: calling a Transactional method on this bypasses the proxy
        public void checkoutWrong(long paise) {
            chargeInternal(paise);
        }

        // RIGHT pattern: move the transactional work into a separate injected bean
        public void checkoutRight(ChargeGateway gateway, long paise) {
            gateway.charge(paise);
        }
    }

    static class ChargeGateway {
        public void charge(long paise) {
            System.out.println("Charging Rs " + (paise / 100) + " through a proxied bean");
        }
    }

    public static void main(String[] args) throws Exception {

        PaymentService service = new PaymentService();
        service.checkoutWrong(50000L);
        service.checkoutRight(new ChargeGateway(), 50000L);

        // DISADVANTAGE 5: private is not security, reflection reads it
        Field f = PaymentService.class.getDeclaredField("apiSecret");
        f.setAccessible(true);
        String stolen = (String) f.get(service);
        System.out.println("Reflection read the private field: " + stolen);

        // RIGHT mitigation: never keep a long lived secret as a plain String field.
        // Use a char array you can wipe, or fetch it from a vault per call.
        char[] secret = "sk_live_1234567890".toCharArray();
        java.util.Arrays.fill(secret, '0');
        System.out.println("Wiped secret buffer: " + new String(secret));
    }
}
// OUTPUT:
// Charging Rs 500 with no transaction advice
// Charging Rs 500 through a proxied bean
// Reflection read the private field: sk_live_1234567890
// Wiped secret buffer: 000000000000000000`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples (Advanced)</h3>
<ul>
<li><b>Core banking API:</b> the module exports only com.bank.api, so com.bank.internal.ledger stays unreachable even though its classes are public.</li>
<li><b>Spring Boot service:</b> a repository field is private and final with constructor injection, which makes the bean immutable and testable.</li>
<li><b>Payment gateway SDK:</b> the request builder is public, the HTTP signing helper is package private, so a customer cannot depend on the signing format.</li>
<li><b>NPCI style switch:</b> sealed interface Transaction permits Upi, Imps and Neft, with package private records as the implementations.</li>
<li><b>Global example, the JDK itself:</b> jdk.internal packages are not exported, which is why Unsafe based libraries broke on Java 9.</li>
<li><b>Audit finding:</b> a getter returning the internal char array of a PIN was flagged, and the fix was to return a masked String only.</li>
</ul>

<p><b>Interview answers to keep ready</b></p>
<ul>
<li>Can a top level class be private? No. Only public or package private. Nested classes may be private.</li>
<li>Is protected wider or narrower than default? Wider, because it adds subclasses outside the package on top of package access.</li>
<li>Can you reduce visibility when overriding? No. An override may widen access but never narrow it.</li>
<li>Why is a Transactional private method ignored? Spring uses a proxy or a subclass, and neither can intercept a private call.</li>
</ul>`,
                                codeExamples: [
                                    `// Point 6 at expert level: sealed API surface with hidden implementations

import java.util.List;

public class SealedApiSurfaceDemo {

    // PUBLIC API: the only type a caller ever names
    public sealed interface Transaction
            permits UpiTransaction, ImpsTransaction, NeftTransaction {
        long amountPaise();
        String reference();
    }

    // Implementations would be package private in a real module
    record UpiTransaction(long amountPaise, String reference, String vpa)
            implements Transaction { }

    record ImpsTransaction(long amountPaise, String reference, String ifsc)
            implements Transaction { }

    record NeftTransaction(long amountPaise, String reference, String batchId)
            implements Transaction { }

    // Exhaustive switch is possible only because the interface is sealed
    static long feePaise(Transaction t) {
        return switch (t) {
            case UpiTransaction u  -> 0L;                       // UPI is free
            case ImpsTransaction i -> Math.max(500L, t.amountPaise() / 1000);
            case NeftTransaction n -> 250L;
        };
    }

    // WRONG design: a public abstract class with public fields lets any team
    // add a fourth type and silently break every switch in the codebase.

    public static void main(String[] args) {

        List<Transaction> batch = List.of(
                new UpiTransaction(250075L, "UPI-9981", "meera@okhdfc"),
                new ImpsTransaction(1500000L, "IMPS-4412", "SBIN0001234"),
                new NeftTransaction(75000L, "NEFT-7761", "BATCH-09"));

        long totalFee = 0;
        for (Transaction t : batch) {
            long fee = feePaise(t);
            totalFee += fee;
            System.out.println(t.reference() + " amount Rs " + (t.amountPaise() / 100)
                    + " fee Rs " + (fee / 100) + "." + String.format("%02d", fee % 100));
        }
        System.out.println("Total fee: Rs " + (totalFee / 100)
                + "." + String.format("%02d", totalFee % 100));
    }
}
// OUTPUT:
// UPI-9981 amount Rs 2500 fee Rs 0.00
// IMPS-4412 amount Rs 15000 fee Rs 15.00
// NEFT-7761 amount Rs 750 fee Rs 2.50
// Total fee: Rs 17.50`
                                ]
                            }
                        ]
};
