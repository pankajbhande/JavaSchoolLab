package com.javaschoollab.security;

/** The signed-in user, as carried inside the JWT (same claims as the Node server). */
public record AuthUser(long id, String fullName, String email, String mobile) {}
