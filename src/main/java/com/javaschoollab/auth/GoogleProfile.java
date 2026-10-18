package com.javaschoollab.auth;

/** What Google vouches for after the sign-in token is checked: a verified email address and a display name. */
public record GoogleProfile(String email, String name) {}
