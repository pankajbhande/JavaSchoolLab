import { Topic } from '../coreJava';

export const springBootMultipleDatabases: Topic = {
    id: 'spring-boot-multiple-databases',
    name: 'Working with Multiple Databases',
    beginner: [
        {
            content: `<h3>Spring Boot - Multiple Data Source Working</h3>
A Spring Boot application is not limited to one database. It can hold a <strong>separate connection to each schema</strong>, each with its own pool, its own Hibernate session factory and its own transactions.<br><br>

<h3>Business Requirement</h3>
Suppose you want to store the user data and the policy data in <strong>different schemas</strong>. One application, two databases. That is what the multiple data source configuration is for.<br><br>

<h3>Problem Statement</h3>
<div class="border">
1.1 Design the RESTful web service to store the user data into the <code>datasource1</code> schema<br>
1.2 Design the RESTful web service to store the policy data into the <code>datasource2</code> schema
</div><br>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot Starter project<br>
2. Add the Maven dependencies to pom.xml<br>
3. Create the model classes - one package per database<br>
4. Create the service interfaces<br>
5. Create the service implementations<br>
6. Create the repositories - one package per database<br>
7. Create the REST controllers<br>
8. Create the database configuration classes<br>
9. Write the application.properties file<br>
10. Run the Spring Boot application<br>
11. Open Postman and send the requests<br>
12. Go to the database and check the rows
</div><br>

The one thing that makes this different from every earlier example: the moment you define your own <code>DataSource</code> bean, <strong>Spring Boot's auto-configuration steps aside</strong> and you become responsible for the whole chain of beans behind it.<br>`,
            codeExamples: [
                `Package Structure

com.velocity
 |
 +-- SpringBootMultipleDataSourceApplication.java
 |
 +-- config
 |    +-- UserDBConfig.java          <- datasource1  (@Primary)
 |    +-- PolicyDBConfig.java        <- datasource2
 |
 +-- model
 |    +-- user
 |    |    +-- User.java             <- scanned by the USER entity manager
 |    +-- policy
 |         +-- Policy.java           <- scanned by the POLICY entity manager
 |
 +-- user
 |    +-- repository
 |         +-- UserRepository.java   <- scanned by @EnableJpaRepositories (user)
 |
 +-- policy
 |    +-- repository
 |         +-- PolicyRepository.java <- scanned by @EnableJpaRepositories (policy)
 |
 +-- service
 |    +-- userservice
 |    |    +-- UserService.java / UserServiceImpl.java
 |    +-- policyservice
 |         +-- PolicyService.java / PolicyServiceImpl.java
 |
 +-- controller
      +-- usercontroller/UserController.java
      +-- policycontroller/PolicyController.java

// The package split is NOT cosmetic. Each configuration class points at
// exactly one entity package and one repository package. If two databases
// share a package, the configuration cannot tell them apart.`
            ]
        },
        {
            content: `<h3>Steps 1 and 2 - Project and Dependencies</h3>
Create the project with <code>File -> New -> Spring Starter Project</code>, enter the name and artifact, then accept the defaults.<br><br>

Nothing here is special to multiple databases - <strong>spring-boot-starter-data-jpa</strong>, <strong>spring-boot-starter-web</strong> and the MySQL driver are the same dependencies a single-database project uses. The difference is entirely in the configuration classes.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- The PDF also lists spring-boot-starter-tomcat with <scope>provided</scope>.
     That scope is for building a WAR to deploy on an external Tomcat. If you
     run this as an executable jar, "provided" removes the embedded server and
     the application starts and exits immediately with no port open. Leave the
     tomcat dependency out entirely - spring-boot-starter-web already brings it. -->`
            ]
        },
        {
            content: `<h3>Step 3 - Model Classes</h3>
Two entities, and - this is the part that matters - <strong>two different packages</strong>. <code>User</code> lives in <code>com.velocity.model.user</code>, <code>Policy</code> in <code>com.velocity.model.policy</code>. Each entity manager is told to scan exactly one of those packages.<br><br>

The entities themselves are ordinary JPA classes. There is no annotation on an entity that says which database it belongs to; <strong>the mapping is made by the package it sits in</strong>.<br>`,
            codeExamples: [
                `// Step 3a - User model
package com.velocity.model.user;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
// Spring Boot 3.x: change every javax.persistence import to jakarta.persistence.

@Entity
@Table(name = "USER_TB")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String userName;

    public User() {
    }

    public User(int id, String userName) {
        super();
        this.id = id;
        this.userName = userName;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }
}`,
                `// Step 3b - Policy model
package com.velocity.model.policy;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "POLICY_TB")
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;

    public Policy() {
    }

    public Policy(int id, String name) {
        super();
        this.id = id;
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}`
            ]
        },
        {
            content: `<h3>Steps 4 and 5 - Services</h3>
Two interfaces and two implementations. Neither one knows anything about data sources - they call a repository and the repository has already been bound to the right database by the configuration class.<br><br>

That is the point of the whole exercise: <strong>the multi-database wiring stays in the configuration layer</strong> and the business code stays unaware of it.<br>`,
            codeExamples: [
                `// Step 4 - the interfaces
package com.velocity.service.userservice;

import com.velocity.model.user.User;

public interface UserService {
    public User saveUser(User user);
}

// ---------------------------------------------------------------

package com.velocity.service.policyservice;

import com.velocity.model.policy.Policy;

public interface PolicyService {
    public Policy savePolicy(Policy policy);
}`,
                `// Step 5a - UserServiceImpl.java
package com.velocity.service.userservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.velocity.model.user.User;
import com.velocity.user.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User saveUser(User user) {
        User user1 = userRepository.save(user);
        return user1;
    }
}`,
                `// Step 5b - PolicyServiceImpl.java
package com.velocity.service.policyservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.velocity.model.policy.Policy;
import com.velocity.policy.repository.PolicyRepository;

@Service
public class PolicyServiceImpl implements PolicyService {

    @Autowired
    private PolicyRepository policyRepository;
    // The PDF names this field "bookRepository" - a leftover from a
    // copy-pasted example. It compiles, because injection is by TYPE,
    // not by name. It is still worth renaming: a reader looking for
    // the policy repository will not find it.

    @Override
    public Policy savePolicy(Policy policy) {
        Policy policies = policyRepository.save(policy);
        return policies;
    }
}`
            ]
        },
        {
            content: `<h3>Step 6 - Repositories</h3>
Two <code>JpaRepository</code> interfaces in two separate packages. Note the ID type: both entities declare <code>private int id</code>, so the repository parameter is <code>Integer</code> - the boxed form of the field's type. Getting this wrong (<code>JpaRepository&lt;User, Long&gt;</code> against an <code>int</code> id) produces a startup failure rather than a compile error, which makes it harder to spot.<br>`,
            codeExamples: [
                `// Step 6a - UserRepository.java
package com.velocity.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.velocity.model.user.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
}`,
                `// Step 6b - PolicyRepository.java
package com.velocity.policy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.velocity.model.policy.Policy;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Integer> {
}`
            ]
        },
        {
            content: `<h3>Step 7 - REST Controllers</h3>
One POST endpoint per database. <code>/saveUser</code> ends up in <code>datasource1</code>, <code>/savePolicy</code> in <code>datasource2</code>, and neither controller contains a single line that says so.<br>`,
            codeExamples: [
                `// Step 7a - UserController.java
package com.velocity.controller.usercontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.velocity.model.user.User;
import com.velocity.service.userservice.UserService;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/saveUser")
    public User saveUser(@RequestBody User user) {
        User user1 = userService.saveUser(user);
        return user1;
    }
}`,
                `// Step 7b - PolicyController.java
package com.velocity.controller.policycontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.velocity.model.policy.Policy;
import com.velocity.service.policyservice.PolicyService;

@RestController
public class PolicyController {

    @Autowired
    private PolicyService policyService;

    @PostMapping("/savePolicy")
    public Policy savePolicy(@RequestBody Policy policy) {
        Policy policies = policyService.savePolicy(policy);
        return policies;
    }
}`
            ]
        },
        {
            content: `<h3>Step 8 - The Database Configuration Classes</h3>
This is the heart of the topic. Each database needs <strong>three beans</strong>, and one of the two sets must be marked <strong>@Primary</strong>.<br><br>

<table>
<tr><th>Bean</th><th>Purpose</th></tr>
<tr><td><code>DataSource</code></td><td>The connection pool - URL, credentials, driver, pool size.</td></tr>
<tr><td><code>LocalContainerEntityManagerFactoryBean</code></td><td>The Hibernate session factory. It is told which <em>entity</em> packages to scan and which dialect and DDL mode to use.</td></tr>
<tr><td><code>PlatformTransactionManager</code></td><td>Begins, commits and rolls back transactions on that one entity manager.</td></tr>
</table>
<br>
<code>@EnableJpaRepositories</code> then ties a <strong>repository package</strong> to that entity manager and that transaction manager. Read it as: "the repositories in <em>this</em> package are backed by <em>that</em> entity manager".<br>`,
            codeExamples: [
                `// Step 8a - UserDBConfig.java  (the PRIMARY data source)
package com.velocity.config;

import java.util.HashMap;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        basePackages = "com.velocity.user.repository",
        entityManagerFactoryRef = "entityManagerFactory",
        transactionManagerRef = "transactionManager")
public class UserDBConfig {

    @Primary
    @Bean(name = "dataSource")
    @ConfigurationProperties(prefix = "spring.user.datasource")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    @Primary
    @Bean(name = "entityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("dataSource") DataSource dataSource) {

        HashMap<String, Object> properties = new HashMap<>();
        properties.put("hibernate.hbm2ddl.auto", "update");
        properties.put("hibernate.dialect", "org.hibernate.dialect.MySQL8Dialect");

        return builder.dataSource(dataSource)
                      .properties(properties)
                      .packages("com.velocity.model.user")
                      .persistenceUnit("User")
                      .build();
    }

    @Primary
    @Bean(name = "transactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("entityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}

// Two corrections against the PDF:
//   1. The PDF omits transactionManagerRef here. It happens to work,
//      because the default value is literally "transactionManager" and
//      that is the bean name used. Write it out anyway - relying on a
//      default that matches by coincidence is how the second config
//      class silently ends up sharing the first one's transactions.
//   2. The PDF uses MySQL5Dialect in the config class while
//      application.properties says MySQL8Dialect. Only the value in the
//      HashMap is read here (see Step 9), so the PDF quietly runs the
//      MySQL 5 dialect against a MySQL 8 server.`,
                `// Step 8b - PolicyDBConfig.java  (the SECONDARY data source - no @Primary)
package com.velocity.config;

import java.util.HashMap;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        basePackages = "com.velocity.policy.repository",
        entityManagerFactoryRef = "policyEntityManagerFactory",
        transactionManagerRef = "policyTransactionManager")
public class PolicyDBConfig {

    @Bean(name = "policyDataSource")
    @ConfigurationProperties(prefix = "spring.policy.datasource")
    public DataSource policyDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "policyEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean policyEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("policyDataSource") DataSource dataSource) {

        HashMap<String, Object> properties = new HashMap<>();
        properties.put("hibernate.hbm2ddl.auto", "update");
        properties.put("hibernate.dialect", "org.hibernate.dialect.MySQL8Dialect");

        return builder.dataSource(dataSource)
                      .properties(properties)
                      .packages("com.velocity.model.policy")
                      .persistenceUnit("Policy")
                      .build();
    }

    @Bean(name = "policyTransactionManager")
    public PlatformTransactionManager policyTransactionManager(
            @Qualifier("policyEntityManagerFactory") EntityManagerFactory policyEntityManagerFactory) {
        return new JpaTransactionManager(policyEntityManagerFactory);
    }
}

// The PDF names this method dataSource() in BOTH classes. Java allows it -
// they are different classes - but two @Bean methods with the same method
// name make stack traces and @Qualifier mistakes far harder to read.
// Name the method after the bean it produces: policyDataSource().`
            ]
        },
        {
            content: `<h3>Step 9 - application.properties</h3>
Two prefixes, <code>spring.user.datasource</code> and <code>spring.policy.datasource</code>, each bound to its own <code>DataSource</code> by <code>@ConfigurationProperties</code>.<br><br>

Two details bite everybody the first time.<br><br>

<table>
<tr><th>Detail</th><th>Why</th></tr>
<tr><td><code>jdbcUrl</code>, not <code>url</code></td><td><code>DataSourceBuilder</code> produces a <strong>HikariDataSource</strong>, and Hikari's setter is <code>setJdbcUrl</code>. Writing <code>spring.user.datasource.url</code> leaves the URL null and startup fails with <em>jdbcUrl is required with driverClassName</em>.</td></tr>
<tr><td><code>spring.jpa.*</code> is ignored</td><td>Those keys are read by Spring Boot's <em>auto-configured</em> entity manager. You built yours by hand, so only the <code>HashMap</code> in the config class is applied.</td></tr>
</table>`,
            codeExamples: [
                `# Step 9 - application.properties

#MYSQL - user schema (primary)
spring.user.datasource.jdbcUrl=jdbc:mysql://localhost:3306/datasource1?useSSL=false&serverTimezone=UTC
spring.user.datasource.username=root
spring.user.datasource.password=root
spring.user.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

#MYSQL - policy schema (secondary)
spring.policy.datasource.jdbcUrl=jdbc:mysql://localhost:3306/datasource2?useSSL=false&serverTimezone=UTC
spring.policy.datasource.username=root
spring.policy.datasource.password=root
spring.policy.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# These three are inert in this project - kept only because the PDF has them.
# A hand-built LocalContainerEntityManagerFactoryBean does not read spring.jpa.*
spring.jpa.show-sql=true

# Corrections against the PDF:
#   com.mysql.jdbc.Driver  ->  com.mysql.cj.jdbc.Driver
#   The old class is deprecated in Connector/J 8 and logs:
#     "Loading class 'com.mysql.jdbc.Driver'. This is deprecated. The new
#      driver class is 'com.mysql.cj.jdbc.Driver'."
#
#   The PDF also sets:
#     spring.autoconfigure.exclude=...jdbc.DataSourceAutoConfiguration
#   That line is unnecessary. DataSourceAutoConfiguration is @ConditionalOnMissingBean
#   already, so defining your own DataSource disables it. Excluding it by hand
#   also switches off DataSourceTransactionManager and the /actuator/health
#   database indicator, which you may still want.`,
                `-- Create both schemas BEFORE the first run.
-- hbm2ddl "update" creates TABLES, never the SCHEMA itself.

CREATE DATABASE datasource1;
CREATE DATABASE datasource2;

-- Missing schema, startup failure:
-- java.sql.SQLSyntaxErrorException: Unknown database 'datasource2'`
            ]
        },
        {
            content: `<h3>Steps 10 to 12 - Run, Test, Verify</h3>
Right-click the project, <code>Run As -> Spring Boot App</code>. The console tells you straight away whether both data sources came up: you get <strong>two HikariPool startups</strong> and <strong>two persistence units</strong>.<br><br>

Then send one POST to each endpoint from Postman and confirm the rows landed in different schemas.<br>`,
            codeExamples: [
                `// Step 10 - CONSOLE on startup
// HHH000204: Processing PersistenceUnitInfo [name: User]
// HikariPool-1 - Starting...
// HikariPool-1 - Added connection com.mysql.cj.jdbc.ConnectionImpl@1a2b3c4d
// HikariPool-1 - Start completed.
// Initialized JPA EntityManagerFactory for persistence unit 'User'
//
// HHH000204: Processing PersistenceUnitInfo [name: Policy]
// HikariPool-2 - Starting...
// HikariPool-2 - Added connection com.mysql.cj.jdbc.ConnectionImpl@5e6f7a8b
// HikariPool-2 - Start completed.
// Initialized JPA EntityManagerFactory for persistence unit 'Policy'
//
// Tomcat started on port(s): 8080 (http) with context path ''
// Started SpringBootMultipleDataSourceApplication in 6.412 seconds
//
// TWO pools, TWO persistence units. If you see only one, one of the
// configuration classes is not being component-scanned - check that
// com.velocity.config sits under the @SpringBootApplication package.`,
                `// Step 11a - POST http://localhost:8080/saveUser
// Body -> raw -> JSON
{
    "userName": "ajay"
}

// RESPONSE 201 / 200 OK
{
    "id": 1,
    "userName": "ajay"
}

// Hibernate SQL on the console:
// Hibernate: insert into USER_TB (userName) values (?)`,
                `// Step 11b - POST http://localhost:8080/savePolicy
// Body -> raw -> JSON
{
    "name": "Life Insurance"
}

// RESPONSE 200 OK
{
    "id": 1,
    "name": "Life Insurance"
}

// Hibernate SQL on the console:
// Hibernate: insert into POLICY_TB (name) values (?)`,
                `-- Step 12 - verify in MySQL

USE datasource1;
SELECT * FROM USER_TB;
-- +----+----------+
-- | id | userName |
-- +----+----------+
-- |  1 | ajay     |
-- +----+----------+

USE datasource2;
SELECT * FROM POLICY_TB;
-- +----+----------------+
-- | id | name           |
-- +----+----------------+
-- |  1 | Life Insurance |
-- +----+----------------+

-- Both ids are 1. They are independent sequences in independent schemas -
-- there is no shared identity space across data sources.`
            ]
        },
        {
            content: `<h3>Application Flow</h3>
Follow one request end to end and the role of each bean becomes obvious.<br>`,
            codeExamples: [
                `POST /savePolicy   {"name":"Life Insurance"}
        |
        v
  PolicyController
        |
        v
  PolicyServiceImpl  ---->  PolicyRepository
                                  |
                                  |  which repositories live in
                                  |  com.velocity.policy.repository?
                                  v
                    @EnableJpaRepositories(basePackages = "com.velocity.policy.repository",
                                           entityManagerFactoryRef = "policyEntityManagerFactory",
                                           transactionManagerRef  = "policyTransactionManager")
                                  |
                +-----------------+------------------+
                v                                    v
   policyEntityManagerFactory              policyTransactionManager
   (scans com.velocity.model.policy)       (begin / commit / rollback)
                |
                v
        policyDataSource  (HikariPool-2)
                |
                v
        jdbc:mysql://localhost:3306/datasource2
                |
                v
           POLICY_TB

// The SAME diagram with "user" substituted for "policy" describes /saveUser,
// ending at HikariPool-1 and datasource1. Two parallel stacks, sharing nothing
// below the service layer.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Exactly One DataSource Must Be @Primary</h3>
The instant a second <code>DataSource</code> bean exists, every injection point that asks for "a <code>DataSource</code>" becomes ambiguous. Spring will not guess. <strong>@Primary</strong> is the tie-breaker: it marks the bean to use when a request is by type and nothing narrows it further.<br><br>

Leave it off and the container fails at startup with <strong>NoUniqueBeanDefinitionException</strong>. Put it on <em>both</em> and you get the same class of failure with a different message - <em>more than one 'primary' bean found</em>.<br><br>

The rule is per type, and it applies three times over: one <code>DataSource</code>, one <code>EntityManagerFactory</code> and one <code>PlatformTransactionManager</code> must be primary, and they should all be the <strong>same side</strong>. Marking the user data source primary but the policy transaction manager primary produces an application that starts cleanly and then commits the wrong transactions.<br><br>

<table>
<tr><th>Situation</th><th>Result</th></tr>
<tr><td>No <code>@Primary</code></td><td><code>NoUniqueBeanDefinitionException</code> at startup for anything injecting by type.</td></tr>
<tr><td><code>@Primary</code> on both</td><td><code>NoUniqueBeanDefinitionException: more than one 'primary' bean found</code>.</td></tr>
<tr><td><code>@Primary</code> on one, mixed sides</td><td>Starts. Silently wrong at runtime.</td></tr>
<tr><td><code>@Qualifier</code> everywhere instead</td><td>Works, but every third-party library that injects a bare <code>DataSource</code> - Flyway, Liquibase, Batch, Actuator - breaks.</td></tr>
</table>
<br>
That last row is the real argument for <code>@Primary</code>: <strong>you do not control every injection point</strong>. Framework and library code asks for a <code>DataSource</code> by type and has no way to pass your qualifier.<br>`,
            codeExamples: [
                `// OUTPUT with @Primary removed from UserDBConfig:
//
// APPLICATION FAILED TO START
//
// Description:
// Parameter 1 of method entityManagerFactory in
//   org.springframework.boot.autoconfigure.orm.jpa.JpaBaseConfiguration
//   required a single bean, but 2 were found:
//     - dataSource: defined by method 'dataSource' in class path resource
//                   [com/velocity/config/UserDBConfig.class]
//     - policyDataSource: defined by method 'policyDataSource' in class path
//                   resource [com/velocity/config/PolicyDBConfig.class]
//
// Action:
// Consider marking one of the beans as @Primary, updating the consumer to
// accept multiple beans, or using @Qualifier to identify the bean that
// should be consumed
//
// Caused by:
// org.springframework.beans.factory.NoUniqueBeanDefinitionException:
//   No qualifying bean of type 'javax.sql.DataSource' available:
//   expected single matching bean but found 2`,
                `// OUTPUT with @Primary on BOTH data sources:
//
// org.springframework.beans.factory.NoUniqueBeanDefinitionException:
//   No qualifying bean of type 'javax.sql.DataSource' available:
//   more than one 'primary' bean found among candidates:
//   [dataSource, policyDataSource]
//
// "Primary" means exactly one. Two primaries is the same as none.`,
                `// Which side should be primary?
//
// The one that most code implicitly uses:
//   - the schema Flyway/Liquibase migrates
//   - the schema Actuator's health check should report on
//   - the schema Spring Batch writes its JobRepository into
//   - the transaction manager a bare @Transactional should pick up
//
// Choosing the "smaller" or "less important" database as primary is a
// common mistake. Primary is not a statement about importance - it is
// the default that unqualified code silently receives.`
            ]
        },
        {
            content: `<h3>The Three Beans, and Why Nothing Less Works</h3>
The single-database case hides all of this. Boot's auto-configuration builds a <code>DataSource</code>, an <code>EntityManagerFactory</code> over it, and a <code>JpaTransactionManager</code> over that, and hands you repositories. Define one <code>DataSource</code> bean yourself and <code>DataSourceAutoConfiguration</code> backs off - it is <code>@ConditionalOnMissingBean</code> - and the whole chain becomes yours.<br><br>

<table>
<tr><th>Bean</th><th>Responsibility</th></tr>
<tr><td><code>DataSource</code></td><td>Pooled JDBC connections. Knows the URL and credentials. Knows nothing about entities.</td></tr>
<tr><td><code>LocalContainerEntityManagerFactoryBean</code></td><td>Builds the Hibernate <code>SessionFactory</code>: which entity classes exist, which dialect, which DDL strategy, which second-level cache. Bound to exactly one <code>DataSource</code>.</td></tr>
<tr><td><code>PlatformTransactionManager</code></td><td>Owns the transaction boundary on one entity manager. <code>@Transactional</code> resolves to one of these.</td></tr>
<tr><td><code>@EnableJpaRepositories</code></td><td>Not a bean - a scanner. It generates repository proxies for one package and injects the named entity manager and transaction manager into them.</td></tr>
</table>
<br>
Omit any one of the three and the failure is not subtle, but it also is not obviously about the missing bean. A missing second <code>PlatformTransactionManager</code>, for instance, does not fail at startup - the second set of repositories quietly enlists in the <em>first</em> database's transaction manager, so a rollback on the policy side rolls back nothing.<br>`,
            codeExamples: [
                `// The wiring, spelled out

@EnableJpaRepositories(
        basePackages          = "com.velocity.policy.repository",   // WHICH repositories
        entityManagerFactoryRef = "policyEntityManagerFactory",     // WHICH Hibernate session
        transactionManagerRef   = "policyTransactionManager")       // WHICH tx boundary

//   basePackages  ------> the repository interfaces to proxy
//   entityManagerFactoryRef -> BEAN NAME, resolved as a String at startup
//   transactionManagerRef   -> BEAN NAME, resolved lazily on first transaction

// Both refs are Strings, so a typo is not a compile error.
// entityManagerFactoryRef typo, at STARTUP:
//   NoSuchBeanDefinitionException: No bean named 'policyEntityMangerFactory'
//   available
//
// transactionManagerRef typo, at the FIRST WRITE (not at startup):
//   NoSuchBeanDefinitionException: No bean named 'policyTxManager' available
//   ... which surfaces as a 500 from the endpoint, in production, days later.
// This is the strongest argument for an integration test that actually
// writes a row to each database.`,
                `// Deriving the bean names instead of retyping them, so the
// compiler catches the typo:

public final class BeanNames {
    public static final String POLICY_EMF = "policyEntityManagerFactory";
    public static final String POLICY_TX  = "policyTransactionManager";
    private BeanNames() {}
}

@Configuration
@EnableJpaRepositories(
        basePackages          = "com.velocity.policy.repository",
        entityManagerFactoryRef = BeanNames.POLICY_EMF,
        transactionManagerRef   = BeanNames.POLICY_TX)
public class PolicyDBConfig {

    @Bean(name = BeanNames.POLICY_EMF)
    public LocalContainerEntityManagerFactoryBean policyEntityManagerFactory(...) { ... }

    @Bean(name = BeanNames.POLICY_TX)
    public PlatformTransactionManager policyTransactionManager(...) { ... }
}
// Annotation values must be compile-time constants, which "static final
// String" is. Now a rename breaks the build instead of the endpoint.`
            ]
        },
        {
            content: `<h3>Why the Packages Must Be Split - and What Happens When They Are Not</h3>
Neither <code>User</code> nor <code>UserRepository</code> carries any marker saying "datasource1". The <strong>only</strong> thing that binds them to a database is the package they sit in, because <code>.packages(...)</code> and <code>basePackages = ...</code> both address packages.<br><br>

That makes the package structure load-bearing. A developer who drops a new repository into the nearest convenient package has changed which database it talks to, without changing a line of configuration.<br><br>

<div class="border">
<strong>Rule 1:</strong> no package may be scanned by two configurations. Overlapping <code>basePackages</code> means two sets of proxies for the same interface.<br>
<strong>Rule 2:</strong> a repository outside every <code>basePackages</code> is never created at all.<br>
<strong>Rule 3:</strong> an entity outside every <code>.packages(...)</code> is not a known entity, whatever <code>@Entity</code> says.
</div><br>

Rule 2 produces the single most confusing error in this whole topic, because the message names the <em>entity</em> and says nothing about packages.<br>`,
            codeExamples: [
                `// FAILURE 1 - repository in a package no configuration scans.
// e.g. ClaimRepository placed in com.velocity.repository (no sub-package)
//
// OUTPUT:
// APPLICATION FAILED TO START
//
// Field claimRepository in com.velocity.service.ClaimServiceImpl required a
// bean of type 'com.velocity.repository.ClaimRepository' that could not be found.
//
// Action:
// Consider defining a bean of type 'com.velocity.repository.ClaimRepository'
//
// Misleading: you cannot "define" a repository bean - Spring Data generates it.
// The real cause is that no @EnableJpaRepositories basePackages covers
// com.velocity.repository, so the proxy was never generated.`,
                `// FAILURE 2 - repository in the RIGHT package, entity in the WRONG one.
// e.g. Policy left in com.velocity.model.user
//
// OUTPUT:
// java.lang.IllegalArgumentException: Not a managed type:
//   class com.velocity.model.policy.Policy
//   at org.hibernate.metamodel.internal.MetamodelImpl.managedType
//
// "Not a managed type" always means the SAME thing here: the entity was
// not in any package listed in .packages(...) for the entity manager
// that this repository is wired to. @Entity alone is not enough - it
// must also be scanned by the RIGHT entity manager.`,
                `// FAILURE 3 - overlapping basePackages. Both configs scan
// com.velocity.repository (the parent of both sub-packages).
//
// Symptom: no exception. UserRepository and PolicyRepository are BOTH
// proxied twice, and the last configuration processed wins. Every write
// goes to one database. Discovered when a table stays empty.
//
// Guard against it in a test:
@SpringBootTest
class DataSourceWiringTest {

    @Autowired UserRepository userRepository;
    @Autowired PolicyRepository policyRepository;

    @Test
    void repositoriesTargetDifferentDatabases() throws Exception {
        String userDb   = urlOf(userRepository);
        String policyDb = urlOf(policyRepository);
        assertThat(userDb).isNotEqualTo(policyDb);
    }
}
// OUTPUT when the packages overlap:
// expected: not equal but was: "jdbc:mysql://localhost:3306/datasource1"
// One assertion that would have caught it before release.`,
                `// A layout that makes the rules self-enforcing: group by DATABASE
// at the top level, not by architectural layer.

com.velocity
 +-- userdb
 |    +-- config      UserDbConfig
 |    +-- entity      User
 |    +-- repository  UserRepository
 +-- policydb
      +-- config      PolicyDbConfig
      +-- entity      Policy
      +-- repository  PolicyRepository

// Now "which database does this class use?" is answered by the second
// package segment, and a misplaced class looks wrong on sight.`
            ]
        },
        {
            content: `<h3>@Transactional Binds to ONE Transaction Manager</h3>
This is the limitation that surprises people, and it is the question an interviewer asks after you have described the configuration.<br><br>

<code>@Transactional</code> selects <strong>a single</strong> <code>PlatformTransactionManager</code>. Not two. A method that writes to both databases inside one <code>@Transactional</code> block is <strong>not atomic</strong> - one manager commits its connection, the other commits its own, and there is nothing coordinating them. If the second write fails, the first has already committed and stays committed.<br><br>

With no explicit name, <code>@Transactional</code> resolves to the <code>@Primary</code> transaction manager. That is why a write to the secondary database inside a plain <code>@Transactional</code> method appears to work: it runs on the secondary <em>connection</em>, but the transaction boundary is the primary manager's, which means the secondary is running in <strong>auto-commit</strong> and cannot be rolled back.<br><br>

Name the manager explicitly whenever the method touches the non-primary database: <code>@Transactional("policyTransactionManager")</code>.<br>`,
            codeExamples: [
                `// WRONG - looks transactional, is not.
@Service
public class OnboardingService {

    @Autowired private UserRepository userRepository;
    @Autowired private PolicyRepository policyRepository;

    @Transactional                       // -> the PRIMARY tx manager only
    public void onboard(User user, Policy policy) {
        userRepository.save(user);       // datasource1 - inside the transaction
        policyRepository.save(policy);   // datasource2 - NOT inside it
        throw new IllegalStateException("boom");
    }
}
// OUTPUT after the exception:
//   USER_TB   -> empty      (rolled back by transactionManager)
//   POLICY_TB -> 1 row      (auto-committed, nothing to roll back it)
//
// A partial write. In an insurance system that is a customer with a
// policy and no account.`,
                `// CORRECT for a method that touches only the secondary database.
@Service
public class PolicyService {

    @Autowired private PolicyRepository policyRepository;

    @Transactional("policyTransactionManager")   // name it explicitly
    public Policy savePolicy(Policy policy) {
        return policyRepository.save(policy);
    }
}
// Also valid, and clearer about intent:
//   @Transactional(transactionManager = "policyTransactionManager")
//
// Verify which manager is actually in play:
//   logging.level.org.springframework.transaction=DEBUG
// OUTPUT:
//   Creating new transaction with name [com.velocity...savePolicy]:
//     PROPAGATION_REQUIRED,ISOLATION_DEFAULT
//   Opened new EntityManager [SessionImpl(...)] for JPA transaction
//   Initiating transaction commit
//   Committing JPA transaction on EntityManager [SessionImpl(...)]`,
                `// If you genuinely need ONE atomic unit across both databases:
//
// Option A - JTA / XA two-phase commit.
//   Replace both JpaTransactionManagers with a single JtaTransactionManager
//   and use XA-capable data sources (MysqlXADataSource, Atomikos or
//   Narayana as the coordinator).
//
//   <dependency>
//     <groupId>org.springframework.boot</groupId>
//     <artifactId>spring-boot-starter-jta-atomikos</artifactId>
//   </dependency>
//
//   Cost: locks are held across BOTH databases for the whole two-phase
//   protocol, throughput drops sharply, and an in-doubt transaction after
//   a coordinator crash needs manual resolution. XA is correct and slow.
//
// Option B - a saga / compensating transaction.
//   Commit locally, then compensate on failure.
//
//   1. save user      (commit)
//   2. save policy    (commit)
//   3. policy failed? -> issue a compensating delete/deactivate for the user
//
//   Cost: eventual consistency, and every step needs an idempotent
//   compensating action. This is what most real systems choose.
//
// Option C - the honest answer in a design review: the two schemas were
//   probably never meant to be written in one atomic operation. If they
//   are, they may belong in one database with two schemas on the same
//   server, where a single connection and a single transaction cover both.`,
                `// Two sequential transactions is NOT the same as one atomic transaction,
// but it does at least make the failure boundary explicit:

@Service
public class OnboardingService {

    @Autowired private UserService userService;      // @Transactional("transactionManager")
    @Autowired private PolicyService policyService;  // @Transactional("policyTransactionManager")

    public void onboard(User user, Policy policy) {
        User saved = userService.saveUser(user);           // tx 1 - committed
        try {
            policyService.savePolicy(policy);              // tx 2 - separate
        } catch (RuntimeException ex) {
            userService.delete(saved.getId());             // compensate
            throw ex;
        }
    }
}
// Note this method has NO @Transactional. Putting one here would create a
// third, outer transaction on the primary manager that contributes nothing
// and holds a connection open for the duration of both calls.`
            ]
        },
        {
            content: `<h3>Connection Pools: Total Size Is What Matters</h3>
Two data sources means <strong>two independent HikariCP pools</strong>. Each has its own <code>maximum-pool-size</code>, its own idle connections, its own leak detection. Nothing shares.<br><br>

The mistake is sizing each pool as if it were the only one. Copy the single-database default of 10 into both and the application now opens up to <strong>20 connections per instance</strong>. Run eight instances behind a load balancer and that is 160 connections against a MySQL server whose <code>max_connections</code> is typically 151.<br><br>

<table>
<tr><th>Quantity</th><th>How to reason about it</th></tr>
<tr><td>Per-pool size</td><td>Size to the concurrency that <em>that</em> database actually sees, not to a copied default. A rarely-used reporting schema does not need ten connections.</td></tr>
<tr><td>Total per instance</td><td>The sum across all pools. This is what a thread-starved instance actually holds.</td></tr>
<tr><td>Total per cluster</td><td>instances x pools x max-pool-size, plus migration tools, plus admin sessions. Compare against the server's <code>max_connections</code>.</td></tr>
<tr><td>Connections are not free</td><td>Each is a server-side thread and its buffers. Oversized pools make a database slower, not faster - past the point where all cores are busy, more concurrency only adds context switching and lock contention.</td></tr>
</table>
<br>
The counter-intuitive part: <strong>a smaller pool is usually faster</strong>. Hikari's own guidance is that a pool of ten serving requests quickly beats a pool of a hundred where every query waits behind lock contention.<br>`,
            codeExamples: [
                `# Per-source pool tuning. @ConfigurationProperties binds these to
# the HikariDataSource that DataSourceBuilder produced.

# user schema - the hot path
spring.user.datasource.jdbcUrl=jdbc:mysql://localhost:3306/datasource1
spring.user.datasource.username=root
spring.user.datasource.password=root
spring.user.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.user.datasource.maximum-pool-size=10
spring.user.datasource.minimum-idle=5
spring.user.datasource.connection-timeout=3000
spring.user.datasource.leak-detection-threshold=20000
spring.user.datasource.pool-name=user-pool

# policy schema - low traffic, sized accordingly
spring.policy.datasource.jdbcUrl=jdbc:mysql://localhost:3306/datasource2
spring.policy.datasource.username=root
spring.policy.datasource.password=root
spring.policy.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.policy.datasource.maximum-pool-size=4
spring.policy.datasource.minimum-idle=1
spring.policy.datasource.connection-timeout=3000
spring.policy.datasource.pool-name=policy-pool

# Total per instance: 14, not 2 x "whatever the default was".
# pool-name is worth setting - the logs then say "user-pool - Connection
# is not available" instead of the unhelpful "HikariPool-2".`,
                `// OUTPUT when a pool is exhausted:
//
// java.sql.SQLTransientConnectionException: policy-pool - Connection is not
//   available, request timed out after 3001ms.
//     at com.zaxxer.hikari.pool.HikariPool.createTimeoutException
//
// The named pool tells you immediately WHICH database is starved. With
// the default names you would be guessing between HikariPool-1 and -2.

// OUTPUT when the SERVER runs out, which is the multi-source failure mode:
//
// com.mysql.cj.jdbc.exceptions.CommunicationsException:
//   Data source rejected establishment of connection, message from server:
//   "Too many connections"
//
// Note it hits BOTH pools at once, and often on the instance that started
// last - the one that had no connections left to claim.`,
                `// A connection leak is far more likely with two pools, because
// leak-detection is configured per pool and it is easy to set it on one.
//
// OUTPUT with leak-detection-threshold=20000:
//
// WARN c.z.h.pool.ProxyLeakTask : Connection
//   com.mysql.cj.jdbc.ConnectionImpl@3f2a1b leak detection triggered for
//   user-pool, stack trace follows
//   java.lang.Exception: Apparent connection leak detected
//     at com.velocity.report.ReportRunner.stream(ReportRunner.java:44)
//
// Set it on EVERY pool. A leak in the secondary pool with no threshold
// configured simply exhausts the pool with no warning at all.`,
                `# Actuator reports every pool separately once you enable the metrics.
management.endpoints.web.exposure.include=health,metrics
management.endpoint.health.show-details=always

# GET /actuator/metrics/hikaricp.connections.active
# {
#   "name": "hikaricp.connections.active",
#   "measurements": [ { "statistic": "VALUE", "value": 7.0 } ],
#   "availableTags": [
#     { "tag": "pool", "values": [ "user-pool", "policy-pool" ] }
#   ]
# }
#
# GET /actuator/metrics/hikaricp.connections.active?tag=pool:policy-pool
# -> the policy pool alone. Alert on
#    hikaricp.connections.pending > 0 per pool: that is the metric that
#    goes non-zero BEFORE the timeouts start.`
            ]
        },
        {
            content: `<h3>AbstractRoutingDataSource - the Common Real-World Case</h3>
Two genuinely different schemas, as in this walkthrough, is the textbook example. In production, the far more frequent reason for more than one <code>DataSource</code> is <strong>read-replica routing</strong>: one writable primary, one or more read-only replicas, the <em>same</em> schema on both.<br><br>

The configuration above is the wrong shape for that, because it splits by package - and a replica has the same entities and the same repositories as the primary. What you want instead is <strong>one</strong> logical <code>DataSource</code> that picks its physical target per transaction. That is exactly what <code>AbstractRoutingDataSource</code> does.<br><br>

<table>
<tr><th>Aspect</th><th>Separate configs</th><th>AbstractRoutingDataSource</th></tr>
<tr><td>Use case</td><td>Different schemas</td><td>Same schema, different servers</td></tr>
<tr><td>Entities</td><td>Different per source</td><td>Identical</td></tr>
<tr><td>Repositories</td><td>Split by package</td><td>One set</td></tr>
<tr><td>Entity managers</td><td>One per source</td><td>One, over the router</td></tr>
<tr><td>Routing decision</td><td>At compile time, by package</td><td>At runtime, per transaction</td></tr>
</table>
<br>
<code>determineCurrentLookupKey()</code> is called <strong>when the connection is first acquired</strong>, which is at transaction start. That timing is the whole trick, and also the whole trap: the decision cannot change mid-transaction, and it must be made before the first statement runs.<br>`,
            codeExamples: [
                `// The router. One class, and a key held for the current thread.
public enum DbRoute { PRIMARY, REPLICA }

public final class RoutingContext {
    private static final ThreadLocal<DbRoute> ROUTE = new ThreadLocal<>();
    static void set(DbRoute r) { ROUTE.set(r); }
    static DbRoute get()       { return ROUTE.get(); }
    static void clear()        { ROUTE.remove(); }   // MUST be called - see below
    private RoutingContext() {}
}

public class RoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return RoutingContext.get() == null ? DbRoute.PRIMARY : RoutingContext.get();
    }
}
// Defaulting to PRIMARY when nothing is set is deliberate: an unrouted
// write must never silently land on a read-only replica.`,
                `@Configuration
public class RoutingConfig {

    @Bean
    @ConfigurationProperties("app.datasource.primary")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean
    @ConfigurationProperties("app.datasource.replica")
    public DataSource replicaDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean
    @Primary                                   // the ONE DataSource everything sees
    public DataSource routingDataSource(
            @Qualifier("primaryDataSource") DataSource primary,
            @Qualifier("replicaDataSource") DataSource replica) {

        RoutingDataSource routing = new RoutingDataSource();
        routing.setTargetDataSources(Map.of(
                DbRoute.PRIMARY, primary,
                DbRoute.REPLICA, replica));
        routing.setDefaultTargetDataSource(primary);

        // Wrap it so the connection is opened LAZILY - on the first
        // statement rather than at transaction start. Without this,
        // readOnly is not yet set when determineCurrentLookupKey() runs
        // and every transaction routes to PRIMARY.
        return new LazyConnectionDataSourceProxy(routing);
    }
}
// Only ONE entity manager and ONE transaction manager are needed here -
// there is only one logical DataSource. The three-bean-per-source rule
// does not apply.`,
                `// Routing from @Transactional(readOnly = true), so callers need no new API.
@Aspect
@Component
@Order(Ordered.LOWEST_PRECEDENCE - 1)   // must run INSIDE the tx advice
public class ReadOnlyRoutingAspect {

    @Around("@annotation(tx)")
    public Object route(ProceedingJoinPoint pjp, Transactional tx) throws Throwable {
        if (tx.readOnly()) {
            RoutingContext.set(DbRoute.REPLICA);
        }
        try {
            return pjp.proceed();
        } finally {
            RoutingContext.clear();     // NEVER omit this
        }
    }
}

@Service
public class UserQueryService {

    @Transactional(readOnly = true)
    public List<User> findAll() {       // -> replica
        return userRepository.findAll();
    }

    @Transactional
    public User save(User u) {          // -> primary
        return userRepository.save(u);
    }
}
// OUTPUT (logging.level.org.springframework.jdbc=DEBUG):
//   findAll() -> Fetching JDBC Connection from DataSource [replica-pool]
//   save()    -> Fetching JDBC Connection from DataSource [primary-pool]`,
                `// The three failure modes, in the order you will meet them.
//
// 1. Missing RoutingContext.clear().
//    Tomcat reuses threads. A request that routed to REPLICA leaves the
//    ThreadLocal set; the NEXT request on that thread reads it and sends
//    a WRITE to the replica.
//    OUTPUT: java.sql.SQLException: The MySQL server is running with the
//            --read-only option so it cannot execute this statement
//    Intermittent, load-dependent, and it will not reproduce locally.
//
// 2. Replication lag.
//    write to primary -> immediately read from replica -> row not there yet.
//    OUTPUT: 404 on a resource created milliseconds earlier.
//    Fix: read-your-own-writes must stay on the primary. Any read inside a
//    write transaction already does, because the route is fixed at
//    transaction start and the transaction is not readOnly.
//
// 3. No LazyConnectionDataSourceProxy.
//    determineCurrentLookupKey() runs before the readOnly flag is visible,
//    so everything routes to PRIMARY and the replica sits idle.
//    Symptom: no error at all - just a replica with zero traffic.
//    Check it: GET /actuator/metrics/hikaricp.connections.active
//              ?tag=pool:replica-pool -> value 0.0 forever.`,
                `# Related routing patterns, same mechanism:
#
#   Multi-tenancy - the lookup key is the tenant id taken from the JWT or a
#     header, and setTargetDataSources holds one DataSource per tenant. This
#     is the schema-per-tenant model.
#
#   Sharding - the key is derived from the entity id (customerId % shardCount).
#
#   Both share the ThreadLocal-leak problem above. Clear the context in a
#   servlet Filter's finally block, not only in the aspect, so an exception
#   thrown before the aspect runs still cleans up.`
            ]
        },
        {
            content: `<h3>Operational Consequences Worth Knowing Before the Design Review</h3>
Adding a second data source changes more than the persistence layer.<br><br>

<table>
<tr><th>Area</th><th>What changes</th></tr>
<tr><td>Health checks</td><td>Boot auto-configures a <code>DataSourceHealthIndicator</code> per <code>DataSource</code> bean, so <code>/actuator/health</code> reports <code>db</code> entries for both. If one schema is optional, a replica outage now marks the whole instance DOWN and Kubernetes restarts a healthy pod.</td></tr>
<tr><td>Migrations</td><td>Flyway and Liquibase auto-configure against the <strong>primary</strong> data source only. The second schema is not migrated unless you declare a second <code>Flyway</code> bean pointing at it.</td></tr>
<tr><td>Startup time</td><td>Two entity managers means two Hibernate metadata scans and two pool warm-ups, run sequentially. Noticeable on a large model.</td></tr>
<tr><td>Testing</td><td><code>@DataJpaTest</code> configures a single embedded data source and will not reproduce this wiring. Use <code>@SpringBootTest</code> with Testcontainers, or the slice test asserts against the wrong database.</td></tr>
<tr><td>Failure isolation</td><td>The upside: one database down means one feature degraded, not the whole application - provided the code does not call both in one request path.</td></tr>
<tr><td><code>ddl-auto</code></td><td><code>update</code> in this walkthrough is fine for a classroom. <code>create</code> or <code>create-drop</code> drops every table on restart, and with two schemas it does so to both. Production uses <code>validate</code> and a migration tool.</td></tr>
</table>`,
            codeExamples: [
                `// Migrating BOTH schemas - the auto-configuration only does the primary.
@Configuration
public class FlywayConfig {

    @Bean(initMethod = "migrate")
    public Flyway policyFlyway(@Qualifier("policyDataSource") DataSource ds) {
        return Flyway.configure()
                     .dataSource(ds)
                     .locations("classpath:db/migration/policy")
                     .load();
    }
}
// initMethod = "migrate" makes it run at bean creation - which must be
// BEFORE policyEntityManagerFactory, or Hibernate validates a schema that
// has not been migrated yet. Express that with @DependsOn on the entity
// manager factory bean rather than relying on declaration order.
//
// OUTPUT:
// Flyway Community Edition 9.x by Redgate
// Database: jdbc:mysql://localhost:3306/datasource2 (MySQL 8.0)
// Successfully validated 3 migrations
// Migrating schema \`datasource2\` to version "3 - add premium column"
// Successfully applied 1 migration`,
                `# Health: report both, but do not let a non-critical source
# fail the readiness probe.
management.endpoint.health.show-details=always
management.health.db.enabled=true

# GET /actuator/health
# {
#   "status": "UP",
#   "components": {
#     "db": {
#       "status": "UP",
#       "components": {
#         "dataSource":       { "status": "UP", "details": { "database": "MySQL", "validationQuery": "isValid()" } },
#         "policyDataSource": { "status": "UP", "details": { "database": "MySQL", "validationQuery": "isValid()" } }
#       }
#     }
#   }
# }
#
# With datasource2 stopped:
# {
#   "status": "DOWN",
#   "components": { "db": { "status": "DOWN", "components": {
#     "dataSource":       { "status": "UP" },
#     "policyDataSource": { "status": "DOWN",
#       "details": { "error": "...CommunicationsException: Communications link failure" } }
#   } } }
# }
# HTTP 503. Decide deliberately whether that should take the instance out
# of the load balancer - group it into liveness/readiness explicitly:
management.endpoint.health.group.readiness.include=db
management.endpoint.health.group.liveness.include=ping`,
                `// A test that actually exercises both sources. @DataJpaTest will not.
@SpringBootTest
@Testcontainers
class MultiDataSourceIT {

    @Container static MySQLContainer<?> userDb   = new MySQLContainer<>("mysql:8.0");
    @Container static MySQLContainer<?> policyDb = new MySQLContainer<>("mysql:8.0");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.user.datasource.jdbcUrl",   userDb::getJdbcUrl);
        r.add("spring.user.datasource.username",  userDb::getUsername);
        r.add("spring.user.datasource.password",  userDb::getPassword);
        r.add("spring.policy.datasource.jdbcUrl",  policyDb::getJdbcUrl);
        r.add("spring.policy.datasource.username", policyDb::getUsername);
        r.add("spring.policy.datasource.password", policyDb::getPassword);
    }

    @Autowired UserRepository userRepository;
    @Autowired PolicyRepository policyRepository;

    @Test
    void writesGoToTheirOwnDatabase() {
        userRepository.save(new User(0, "ajay"));
        policyRepository.save(new Policy(0, "Life"));

        assertThat(userRepository.count()).isEqualTo(1);
        assertThat(policyRepository.count()).isEqualTo(1);
        // Two separate containers: if the wiring collapsed onto one
        // data source, one of these counts would be 2 and the other 0.
    }
}`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>When does Spring Boot's data source auto-configuration stop applying?</td><td>As soon as you define your own <code>DataSource</code> bean. <code>DataSourceAutoConfiguration</code> is <code>@ConditionalOnMissingBean</code>, so it backs off and you must supply the entity manager factory and transaction manager yourself.</td></tr>
<tr><td>Which beans does each data source need?</td><td>Three: a <code>DataSource</code>, a <code>LocalContainerEntityManagerFactoryBean</code> over it, and a <code>PlatformTransactionManager</code> over that - plus an <code>@EnableJpaRepositories</code> pointing a repository package at the last two by bean name.</td></tr>
<tr><td>Why must exactly one data source be <code>@Primary</code>?</td><td>Injection by type is ambiguous with two candidates. Without a primary you get <code>NoUniqueBeanDefinitionException</code>; with two primaries you get "more than one 'primary' bean found". Library code that injects a bare <code>DataSource</code> cannot pass a qualifier, so the primary is what it receives.</td></tr>
<tr><td>Could you use <code>@Qualifier</code> everywhere instead of <code>@Primary</code>?</td><td>For your own code, yes. It breaks anything you do not control - Flyway, Actuator, Spring Batch - which injects <code>DataSource</code> by type.</td></tr>
<tr><td>What do the three <code>@EnableJpaRepositories</code> attributes do?</td><td><code>basePackages</code> selects which repository interfaces to proxy; <code>entityManagerFactoryRef</code> and <code>transactionManagerRef</code> name the beans those proxies use. Both refs are Strings, so a typo fails at runtime, not compile time.</td></tr>
<tr><td>Why must entities and repositories be in separate packages per database?</td><td>Nothing on the class says which database it belongs to. The package is the only binding - <code>.packages(...)</code> for entities, <code>basePackages</code> for repositories. Overlapping packages means one config silently wins.</td></tr>
<tr><td>A repository is in a package no config scans - what happens?</td><td>Startup fails with "required a bean of type ... that could not be found" naming the repository interface. The message suggests defining the bean, which is impossible; the real fix is to add the package to a <code>basePackages</code>.</td></tr>
<tr><td>What does <code>IllegalArgumentException: Not a managed type</code> mean here?</td><td>The entity is not in any package scanned by the entity manager that this repository is wired to. <code>@Entity</code> alone does not register it with a specific persistence unit.</td></tr>
<tr><td>Can one <code>@Transactional</code> method atomically write to both databases?</td><td>No. <code>@Transactional</code> binds to one transaction manager. The other database commits independently, so a failure after the first write leaves a partial result.</td></tr>
<tr><td>How do you target the non-primary transaction manager?</td><td><code>@Transactional("policyTransactionManager")</code>, or the equivalent <code>transactionManager = "..."</code> attribute. Unqualified <code>@Transactional</code> resolves to the primary manager.</td></tr>
<tr><td>What if you genuinely need atomicity across both?</td><td>JTA/XA two-phase commit with an <code>JtaTransactionManager</code> and XA data sources, at a significant throughput cost and with in-doubt transactions to resolve after a crash; or a saga with compensating actions, accepting eventual consistency. Most systems choose the saga.</td></tr>
<tr><td>How should the connection pools be sized?</td><td>Per source, to that source's real concurrency - then check the total: instances x pools x max-pool-size against the server's <code>max_connections</code>. Copying a single-database default into both pools doubles the footprint per instance.</td></tr>
<tr><td>Why <code>jdbcUrl</code> rather than <code>url</code> in the properties?</td><td><code>DataSourceBuilder</code> builds a <code>HikariDataSource</code>, whose setter is <code>setJdbcUrl</code>. With <code>url</code> the property does not bind and startup fails with "jdbcUrl is required with driverClassName".</td></tr>
<tr><td>What is <code>AbstractRoutingDataSource</code> for?</td><td>One logical <code>DataSource</code> that selects a physical target at runtime via <code>determineCurrentLookupKey()</code>, called when the connection is acquired. It is the standard answer for read-replica routing, multi-tenancy and sharding - cases where the schema is identical so the package-splitting approach does not apply.</td></tr>
<tr><td>What breaks first in a routing setup?</td><td>A <code>ThreadLocal</code> route left uncleared: a pooled Tomcat thread carries the previous request's key and sends a write to a read-only replica. Always clear it in a <code>finally</code> block. Second is forgetting <code>LazyConnectionDataSourceProxy</code>, which makes everything route to the primary silently.</td></tr>
</table>`
        }
    ]
};
