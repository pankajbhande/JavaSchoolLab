package com.javaschoollab;

import static com.tngtech.archunit.core.importer.ImportOption.Predefined.DO_NOT_INCLUDE_TESTS;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

import com.tngtech.archunit.core.domain.Dependency;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;
import com.javaschoollab.common.PublicApi;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The package-per-service structure, enforced. Each service (user, auth, progress, ...) is one package with a controller,
 * a service and a repository. These tests fail the build when someone breaks the boundaries, so the structure stays easy to
 * maintain. See the "Architecture" section of server-spring/README.md.
 */
class ArchitectureTest {

    private static final String BASE = "com.javaschoollab";

    /** The service packages and the other services each one is allowed to use (always through that service's *Service class). */
    private static final Map<String, Set<String>> ALLOWED = Map.of(
            "user", Set.of(),
            "auth", Set.of("user"),
            "quiz", Set.of(),
            "progress", Set.of("quiz"),
            "leaderboard", Set.of("progress"),
            "notes", Set.of(),
            "certificate", Set.of("quiz"),
            "profile", Set.of("user", "certificate", "progress", "quiz"),
            "content", Set.of(),
            "visitor", Set.of());

    private static final Set<String> INFRASTRUCTURE = Set.of("common", "config", "security", "web");

    private static JavaClasses classes;

    @BeforeAll
    static void importClasses() {
        classes = new ClassFileImporter().withImportOption(DO_NOT_INCLUDE_TESTS).importPackages(BASE);
    }

    private static String packageOf(JavaClass c) {
        String p = c.getPackageName();
        return p.startsWith(BASE + ".") ? p.substring(BASE.length() + 1).split("\\.")[0] : "";
    }

    @Test
    void controllersNeverTouchRepositoriesOrSql() {
        noClasses().that().haveSimpleNameEndingWith("Controller")
                .should().dependOnClassesThat().haveSimpleNameEndingWith("Repository")
                .orShould().dependOnClassesThat().haveFullyQualifiedName("org.springframework.jdbc.core.JdbcTemplate")
                .because("controllers only speak HTTP; business rules live in the service and SQL in the repository")
                .check(classes);
    }

    @Test
    void servicesNeverTouchSqlDirectly() {
        noClasses().that().haveSimpleNameEndingWith("Service")
                .should().dependOnClassesThat().haveFullyQualifiedName("org.springframework.jdbc.core.JdbcTemplate")
                .because("SQL belongs in the repository of the same package")
                .check(classes);
    }

    @Test
    void aRepositoryIsOnlyUsedInsideItsOwnPackage() {
        classes().that().haveSimpleNameEndingWith("Repository")
                .should(new ArchCondition<JavaClass>("only be used by classes of their own package") {
                    @Override
                    public void check(JavaClass repository, ConditionEvents events) {
                        for (Dependency d : repository.getDirectDependenciesToSelf()) {
                            JavaClass user = d.getOriginClass();
                            if (!user.getPackageName().equals(repository.getPackageName())) {
                                events.add(SimpleConditionEvent.violated(d, d.getDescription()));
                            }
                        }
                    }
                })
                .check(classes);
    }

    @Test
    void servicesOnlyUseOtherServicesThroughTheirServiceClassesAndRecords() {
        classes().that(new com.tngtech.archunit.base.DescribedPredicate<JavaClass>("live in a service package") {
            @Override
            public boolean test(JavaClass c) {
                return ALLOWED.containsKey(packageOf(c));
            }
        }).should(new ArchCondition<JavaClass>("use other services only through *Service classes, records, enums and @PublicApi helpers, and only the allowed ones") {
            @Override
            public void check(JavaClass origin, ConditionEvents events) {
                String from = packageOf(origin);
                for (Dependency d : origin.getDirectDependenciesFromSelf()) {
                    JavaClass target = d.getTargetClass();
                    String to = packageOf(target);
                    if (to.isEmpty() || to.equals(from) || INFRASTRUCTURE.contains(to) || !ALLOWED.containsKey(to)) continue;
                    if (!ALLOWED.get(from).contains(to)) {
                        events.add(SimpleConditionEvent.violated(d, "'" + from + "' may not depend on '" + to + "': " + d.getDescription()));
                    } else if (!(target.getSimpleName().endsWith("Service") || target.isRecord() || target.isEnum() || target.isAnnotatedWith(PublicApi.class)
                            || (target.getEnclosingClass().isPresent() && target.getEnclosingClass().get().getSimpleName().endsWith("Service")))) {
                        events.add(SimpleConditionEvent.violated(d, "'" + from + "' must use '" + to + "' through its *Service class, not " + target.getSimpleName() + ": " + d.getDescription()));
                    }
                }
            }
        }).check(classes);
    }

    @Test
    void infrastructureNeverDependsOnAService() {
        classes().that(new com.tngtech.archunit.base.DescribedPredicate<JavaClass>("live in common, config, security or web") {
            @Override
            public boolean test(JavaClass c) {
                return INFRASTRUCTURE.contains(packageOf(c));
            }
        }).should(new ArchCondition<JavaClass>("not depend on a service package") {
            @Override
            public void check(JavaClass origin, ConditionEvents events) {
                for (Dependency d : origin.getDirectDependenciesFromSelf()) {
                    if (ALLOWED.containsKey(packageOf(d.getTargetClass()))) {
                        events.add(SimpleConditionEvent.violated(d, d.getDescription()));
                    }
                }
            }
        }).because("the shared kernel and the infrastructure sit below the services").check(classes);
    }

    @Test
    void thereAreNoCyclesBetweenPackages() {
        slices().matching(BASE + ".(*)..").should().beFreeOfCycles().check(classes);
    }

    @Test
    void everyServicePackageIsDocumented() {
        for (String service : ALLOWED.keySet()) {
            boolean documented = classes.contain(BASE + "." + service + ".package-info");
            if (!documented) {
                throw new AssertionError("Package '" + service + "' has no package-info.java describing the service");
            }
        }
    }
}
