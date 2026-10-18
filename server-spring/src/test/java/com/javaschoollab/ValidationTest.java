package com.javaschoollab;

import static org.assertj.core.api.Assertions.assertThat;

import com.javaschoollab.user.Identifier;
import com.javaschoollab.user.Validation;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class ValidationTest {

    @Test
    void email() {
        assertThat(Validation.identifierError(Identifier.EMAIL, "abaji@example.com")).isNull();
        assertThat(Validation.identifierError(Identifier.EMAIL, "  abaji@example.com ")).isNull();
        assertThat(Validation.identifierError(Identifier.EMAIL, "abaji")).contains("valid email");
        assertThat(Validation.identifierError(Identifier.EMAIL, "a b@x.com")).contains("valid email");
        assertThat(Validation.identifierError(Identifier.EMAIL, "")).isEqualTo("Email is required");
        assertThat(Validation.identifierError(Identifier.EMAIL, null)).isEqualTo("Email is required");
    }

    @Test
    void mobile() {
        assertThat(Validation.identifierError(Identifier.MOBILE, "9876543210")).isNull();
        assertThat(Validation.identifierError(Identifier.MOBILE, "+91 98765-43210")).isNull();
        assertThat(Validation.identifierError(Identifier.MOBILE, "12345")).contains("7 to 15 digits");
        assertThat(Validation.identifierError(Identifier.MOBILE, "98765abc10")).contains("valid mobile");
        assertThat(Validation.identifierError(Identifier.MOBILE, " ")).isEqualTo("Mobile number is required");
    }

    @Test
    void password() {
        assertThat(Validation.passwordError("abcd")).isNull();
        assertThat(Validation.passwordError("abc")).contains("at least 4");
        assertThat(Validation.passwordError(null)).contains("at least 4");
        assertThat(Validation.passwordError("x".repeat(129))).contains("at most 128");
    }

    @Test
    void name() {
        assertThat(Validation.nameError("Tanaji Malusare")).isNull();
        assertThat(Validation.nameError("   ")).isNotNull();
        assertThat(Validation.nameError("x".repeat(101))).isNotNull();
    }

    @Test
    void dateOfBirthMustBeARealDate() {
        assertThat(Validation.dateOfBirth("1995-08-20")).contains(LocalDate.of(1995, 8, 20));
        assertThat(Validation.dateOfBirth("1995-13-45")).isEmpty();
        assertThat(Validation.dateOfBirth("20-08-1995")).isEmpty();
        assertThat(Validation.dateOfBirth(null)).isEmpty();
    }

    @Test
    void identifierColumnsComeFromTheEnumOnly() {
        assertThat(Identifier.of("email")).contains(Identifier.EMAIL);
        assertThat(Identifier.of("mobile")).contains(Identifier.MOBILE);
        assertThat(Identifier.of("email; DROP TABLE users")).isEmpty();
        assertThat(Identifier.of(null)).isEmpty();
    }
}
