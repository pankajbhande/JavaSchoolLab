package com.javaschoollab.common;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a pure helper class (static methods, no state, no Spring) as part of its package's public API, so other service
 * packages may use it directly. Every other class of a service package is internal: other services go through its
 * {@code *Service}, its records and its enums. The architecture test enforces this.
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface PublicApi {}
